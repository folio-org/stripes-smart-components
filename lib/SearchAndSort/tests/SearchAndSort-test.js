import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  Bigtest,
  // Pane,
  Button,
  TextField,
  IconButton,
  HTML,
  including,
  isVisible,
  AdvancedSearch,
  AdvancedSearchRow,
} from '@folio/stripes-testing';
import { Pane as PaneComponent } from '@folio/stripes-components';
import { setupApplication } from '../../../tests/helpers';
import SASTestHarness from './SASTestHarness';

const SRStatusInteractor = HTML.extend('screen reader message')
  .selector('[aria-live]')
  .filters({
    visible: { apply: isVisible, default: false }
  });

// temporary Pane interactor until stripes-testing issue is resolved...
function title(el) { return el.querySelector('[class^=paneTitle]')?.textContent || ''; }

const Pane = HTML.extend('pane')
  .selector('[class^=pane-]')
  .locator(title)
  .filters({
    title,
    subtitle: (el) => el.querySelector('[class^=paneSub]')?.textContent || '',
    titleLabel: el => el.querySelector('[class^=paneTitleLabel-]')?.textContent || '',
  });


describe('SearchAndSort Query Navigation', () => {
  const onResetAllSpy = sinon.spy();
  const filterPane = Pane('Search & filter');
  setupApplication({
    component: (
      <SASTestHarness
        testQindex="contributors"
        testQindexLabel="test-qindex-nav"
        testQuery="testquery"
        testQueryLabel="test-query-nav"
        customPaneSub="Custom pane sub"
        onResetAll={onResetAllSpy}
        title="Test samples"
        module={{ displayName: 'Test samples' }}
        viewRecordComponent={(props) => <PaneComponent {...props}>content</PaneComponent>}
        detailProps={{ paneTitle: 'Single User' }}
        showSingleResult
      />)
  });

  beforeEach(async function () {
    this.server.get('/samples', function ({ users }) {
      const res = users.all();
      return this.serialize(res, 'users');
    });
    await this.server.createList('user', 1000);

    onResetAllSpy.resetHistory();
    window.localStorage.setItem('@folio/ui-dummy/filterPaneVisibility', true);
  });

  it('should display correct custom pane sub', () => Pane({ subtitle: including('Custom pane sub') }).exists());

  describe('Filter Pane', () => {
    it('should be visible', () => filterPane.exists());

    it('should render a collapse button', () => {
      return filterPane.find(IconButton({ icon: 'caret-left' })).exists();
    });

    describe('Clicking the collapse filter pane button', async () => {
      beforeEach(async () => {
        await filterPane.find(IconButton({ icon: 'caret-left' })).click();
      });

      it('should hide the filter pane', async () => {
        await expect(window.localStorage.getItem('@folio/ui-dummy/filterPaneVisibility')).to.equal('false');
        await filterPane.absent();
      });

      it('should render an expand button', () => {
        return Pane('Test samples').find(IconButton({ icon: 'caret-right' })).exists();
      });
    });
  });

  describe('Selecting a query index', () => {
    beforeEach(async () => {
      await Bigtest.Select().choose('contributors');
    });

    it('does not affect query', () => HTML({ id: 'query-debug' }).has({ text: 'search:' }));

    describe('Clicking the search button', () => {
      beforeEach(async () => {
        await TextField().fillIn('test');
        await Button('Search').click();
      });

      it('resetting the query', () => HTML({ id: 'query-debug' }).has({ text: including('qindex') }));

      describe('Clicking the reset all', () => {
        beforeEach(async () => {
          await Button('Reset all').click();
        });

        it('removes the search from the query string', () => HTML({ id: 'query-debug' }).has({ text: 'search:' }));
        it('calls the onResetAll callback', () => {
          expect(onResetAllSpy.called).to.be.true;
        });
      });
    });
  });

  describe('prefer local state values to emptying from query string', () => {
    beforeEach(async () => {
      await TextField().fillIn('test');
    });

    describe('changing the qindex', () => {
      beforeEach(async () => {
        await Bigtest.Select().choose('contributors');
      });

      it('retains the same search term in the text field', () => TextField().has({ value: 'test' }));
    });
  });

  describe('navigating to a qindex parameter', () => {
    beforeEach(async () => {
      await Button('test-qindex-nav').click();
    });

    it('syncs search index select accordingly', () => Bigtest.Select({ value: 'contributors' }).exists());
  });

  describe('navigating to a query parameter', () => {
    beforeEach(async () => {
      await Button('test-query-nav').click();
    });

    it('syncs search text field accordingly', () => TextField({ value: 'testquery' }).exists());
  });

  describe('open single result', () => {
    beforeEach(async function () {
      await this.server.db.users.remove();
      await this.server.create('user', { userName: 'unique-user' });
      await TextField().fillIn('unique-user');
      await Button('Search').click();
    });

    it('sends screen-reader message to SRStatus component', () => SRStatusInteractor({ text: 'Search returned 1 result' }).exists());

    it('opens the pane of the single result', () => Pane('Single User').exists());
  });

  describe('advanced search', () => {
    const advancedSearch = new AdvancedSearch();

    it('should render advanced search button', () => {
      return filterPane.find(Button('Advanced search')).exists();
    });

    describe('when searcing via Advanced search', () => {
      beforeEach(async () => {
        await Button('Advanced search').click();

        await advancedSearch.exists();

        await AdvancedSearchRow({ index: 0 }).fillQuery('test');
        await AdvancedSearchRow({ index: 1 }).selectBoolean(1, 'OR');
        await AdvancedSearchRow({ index: 1 }).selectSearchOption(1, 'contributor');
        await AdvancedSearchRow({ index: 1 }).fillQuery('test 2');

        await advancedSearch.search();
      });

      it('should set correct query', () => TextField().has({ value: 'keyword==test or contributor==test 2' }));

      it('should set correct index', () => Bigtest.Select().has({ value: 'advanced search' }));
    });
  });
});

describe('SearchAndSort when the result ID is in the URL', () => {
  const onSelectRowSpy = sinon.spy();

  setupApplication({
    component: (
      <SASTestHarness
        testQindex="contributors"
        testQindexLabel="test-qindex-nav"
        testQuery="testquery"
        testQueryLabel="test-query-nav"
        customPaneSub="Custom pane sub"
        onSelectRow={onSelectRowSpy}
        title="Test samples"
        module={{ displayName: 'Test samples' }}
        viewRecordComponent={(props) => <PaneComponent {...props}>content</PaneComponent>}
        detailProps={{ paneTitle: 'Single User' }}
        showSingleResult
      />)
  });

  beforeEach(async function () {
    await this.visit('/dummy/view/111');
    this.server.get('/samples', function ({ users }) {
      const res = users.all();
      return this.serialize(res, 'users');
    });
    onSelectRowSpy.resetHistory();
    await this.server.db.users.remove();
    await this.server.create('user', { userName: 'unique-user' });
    await TextField().fillIn('unique-user');
    await Button('Search').click();
  });

  it('should not cause automatic opening of a single result', () => {
    expect(onSelectRowSpy.called).to.be.false;
  });
});

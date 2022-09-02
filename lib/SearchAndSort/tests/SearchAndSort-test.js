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
  including
} from '@folio/stripes-testing';
import { Pane as PaneComponent } from '@folio/stripes-components';
import { setupApplication, wait } from '../../../tests/helpers';
import SASTestHarness from './SASTestHarness';

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

    describe('Clicking the collapse filter pane button', () => {
      beforeEach(async () => {
        await filterPane.find(IconButton({ icon: 'caret-left' })).click();
        await wait(200);
      });

      it('should hide the filter pane', () => filterPane.absent());

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

    it('opens the pane of the single result', () => Pane('Single User').exists());
  });
});

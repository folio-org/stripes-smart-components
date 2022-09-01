import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  SearchField as SearchFieldInteractor,
  Bigtest,
  Pane,
  Button,
  TextField,
  IconButton,
  HTML,
  including
} from '@folio/stripes-testing';

import { setupApplication, mount, wait } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';
import SearchAndSortInteractor from './interactor';
import SearchAndSort from '../SearchAndSort';
import SASTestHarness from './SASTestHarness';

describe('SearchAndSort Query Navigation', () => {
  setupApplication({
    component: (
      <SASTestHarness
        testQindex="contributors"
        testQindexLabel="test-qindex-nav"
        testQuery="testquery"
        testQueryLabel="test-query-nav"
      />)
  });

  beforeEach(async function () {
    await this.server.createList('user', 1000);
  });

  it('should be visible', () => Pane('Search & filter').exists());

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
});

describe('SearchAndSort', () => {
  setupApplication();
  const ConnectedComponent = connectStripes(SearchAndSort);

  beforeEach(async () => {
    mount(
      <ConnectedComponent
        initialResultCount={0}
        resultCountIncrement={0}
        viewRecordPerms="test"
        columnMapping={{}}
        searchableIndexes={[
          { label: 'all', value: 'all' },
          { label: 'contributors', value: 'contributors' },
        ]}
        parentResources={{
          query: { query: 'testquery', qindex: 'contributors' },
          records: {
            isPending: false,
            totalCount: () => 99999,
          }
        }}
        parentMutator={{
          resultCount: {
            replace: () => { }
          },
          resultOffset: {
            replace: () => { }
          },
        }}
        filterConfig={[]}
        packageInfo={{
          stripes: {},
          name: 'Search and sort test',
        }}
        viewRecordComponent={() => <div />}
      />
    );
  });
});

describe('SearchAndSort', () => {
  setupApplication();
  const searchAndSort = new SearchAndSortInteractor();
  const ConnectedComponent = connectStripes(SearchAndSort);
  const onResetAllSpy = sinon.spy();
  const filterPane = Pane('Search & filter');

  beforeEach(() => {
    onResetAllSpy.resetHistory();
    window.localStorage.setItem('@folio/ui-dummy/filterPaneVisibility', true);
    mount(
      <ConnectedComponent
        initialResultCount={0}
        resultCountIncrement={0}
        viewRecordPerms="test"
        objectName="user"
        columnMapping={{}}
        searchableIndexes={[
          { label: 'all', value: 'all' },
          { label: 'contributors', value: 'contributors' },
        ]}
        parentResources={{
          records: {
            isPending: false,
            totalCount: () => 99999,
          }
        }}
        parentMutator={{
          resultCount: {
            replace: () => { }
          },
          resultOffset: {
            replace: () => { }
          },
        }}
        filterConfig={[]}
        packageInfo={{
          stripes: {},
          name: 'Search and sort test',
        }}
        viewRecordComponent={() => <div />}
        customPaneSub="Custom pane sub"
        onResetAll={onResetAllSpy}
        title="Test samples"
      />
    );
  });

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

  describe('clicking on reset all button', () => {
    beforeEach(async () => {
      await searchAndSort.searchField.fillInput('search');
      await searchAndSort.resetAll.click();
    });

    it('should call the provided callback', () => {
      expect(onResetAllSpy.called).to.be.true;
    });
  });

  describe('passing custom pane sub', () => {
    it('should display correct custom pane sub', () => {
      expect(searchAndSort.customPaneSub.text).to.equal('Custom pane sub');
    });
  });
});

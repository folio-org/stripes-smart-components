import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { setupApplication, mount, wait } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

import SearchAndSortInteractor from './interactor';
import SearchAndSort from '../SearchAndSort';

describe('SearchAndSort', () => {
  setupApplication();
  const searchAndSort = new SearchAndSortInteractor();
  const ConnectedComponent = connectStripes(SearchAndSort);
  const onResetAllSpy = sinon.spy();

  beforeEach(() => {
    onResetAllSpy.resetHistory();

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
      />
    );
  });

  describe('Filter Pane', () => {
    it('should be visible', () => {
      expect(searchAndSort.filterPane.isPresent).to.be.true;
    });

    it('should render a collapse button', () => {
      expect(searchAndSort.collapseFilterPaneButton.isPresent).to.be.true;
    });

    describe('Clicking the collapse filter pane button', () => {
      beforeEach(async () => {
        await searchAndSort.collapseFilterPaneButton.click();
        await wait(200);
      });
      it('should hide the filter pane', () => {
        expect(searchAndSort.filterPane.isPresent).to.be.false;
      });
      it('should render an expand button', () => {
        expect(searchAndSort.expandFilterPaneButton.isPresent).to.be.true;
      });
    });
  });

  describe('Select query index', () => {
    beforeEach(async () => {
      await searchAndSort.selectQueryIndex('contributors');
    });

    it('search is not performed', function () {
      expect(this.location.search).to.equal('');
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

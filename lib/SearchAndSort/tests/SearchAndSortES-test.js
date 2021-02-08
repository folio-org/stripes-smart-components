import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { setupApplication, mount, wait } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

import SearchAndSortESInteractor from './interactor';
import SearchAndSortES from '../SearchAndSortES';

describe('SearchAndSortES', () => {
  setupApplication();
  const searchAndSortES = new SearchAndSortESInteractor();
  const ConnectedComponent = connectStripes(SearchAndSortES);
  const onResetAllSpy = sinon.spy();

  beforeEach(() => {
    onResetAllSpy.resetHistory();

    mount(
      <ConnectedComponent
        initialResultCount={0}
        resultCountIncrement={0}
        viewRecordPerms="test"
        objectName="user"
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
      expect(searchAndSortES.filterPane.isPresent).to.be.true;
    });

    it('should render a collapse button', () => {
      expect(searchAndSortES.collapseFilterPaneButton.isPresent).to.be.true;
    });

    describe('Clicking the collapse filter pane button', () => {
      beforeEach(async () => {
        await searchAndSortES.collapseFilterPaneButton.click();
        await wait(200);
      });
      it('should hide the filter pane', () => {
        expect(searchAndSortES.filterPane.isPresent).to.be.false;
      });
      it('should render an expand button', () => {
        expect(searchAndSortES.expandFilterPaneButton.isPresent).to.be.true;
      });
    });
  });

  describe('Select query index', () => {
    beforeEach(async () => {
      await searchAndSortES.selectQueryIndex('contributors');
    });

    it('search is not performed', function () {
      expect(this.location.search).to.equal('');
    });
  });

  describe('clicking on reset all button', () => {
    beforeEach(async () => {
      await searchAndSortES.searchField.fillInput('search');
      await searchAndSortES.resetAll.click();
    });

    it('should call the provided callback', () => {
      expect(onResetAllSpy.called).to.be.true;
    });
  });

  describe('passing custom pane sub', () => {
    it('should display correct custom pane sub', () => {
      expect(searchAndSortES.customPaneSub.text).to.equal('Custom pane sub');
    });
  });
});

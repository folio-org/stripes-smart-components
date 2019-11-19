import React from 'react';
import { describe, before, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { setupApplication, mount, wait } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

import SearchAndSortInteractor from './interactor';
import SearchAndSort from '../SearchAndSort';

describe('SearchAndSort', () => {
  let searchAndSort;
  let ConnectedComponent;

  // mocha prefers non-arrow functions: https://mochajs.org/#arrow-functions
  // eslint-disable-next-line prefer-arrow-callback
  before(function () {
    setupApplication();
    searchAndSort = new SearchAndSortInteractor();
    ConnectedComponent = connectStripes(SearchAndSort);
  });

  beforeEach(() => {
    mount(
      <ConnectedComponent
        initialResultCount={0}
        resultCountIncrement={0}
        viewRecordPerms="test"
        objectName="user"
        parentResources={{
          records: {
            totalCount: () => 99999,
          }
        }}
        parentMutator={{
          resultCount: {
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
});

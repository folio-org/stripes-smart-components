import React, { Component } from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

import SearchAndSortInteractor from './interactor';
import SearchAndSort from '../SearchAndSort';


class MockApp extends Component {
  render() {
    return (
      <SearchAndSort
        initialResultCount={0}
        resultCountIncrement={0}
        viewRecordPerms="test"
        objectName="user"
        parentResources={{}}
        parentMutator={{
          resultCount: {
            replace: () => {}
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
  }
}

const ConnectedComponent = connectStripes(MockApp);


describe.only('SearchAndSort', () => {
  setupApplication();
  const searchAndSort = new SearchAndSortInteractor();

  beforeEach(() => {
    mount(
      <ConnectedComponent />
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

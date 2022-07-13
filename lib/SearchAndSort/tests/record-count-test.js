import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

import SearchAndSortInteractor from './interactor';
import SearchAndSort from '../SearchAndSort';

const defaultProps = {
  initialResultCount: 0,
  resultCountIncrement: 0,
  isCountHidden: false,
  viewRecordPerms: 'test',
  objectName: 'user',
  parentResources: {
    records: {
      isPending: false,
      hasLoaded: true,
      other: { totalRecords: 0 }
    }
  },
  parentMutator: {
    resultCount: {
      replace: () => { }
    },
    resultOffset: {
      replace: () => { }
    },
  },
  filterConfig: [],
  packageInfo: {
    stripes: {},
    name: 'Search and sort test',
  },
  viewRecordComponent: () => <div />,
};

describe('SearchAndSort results', () => {
  describe('0 records found', () => {
    setupApplication();
    const searchAndSort = new SearchAndSortInteractor();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      await mount(<ConnectedComponent {...defaultProps} />);
    });

    describe('0 records found', () => {
      it('results header should show 0 records found', () => {
        expect(searchAndSort.resultsSubtitle).to.equal('0 records found');
      });

      it('results pane should show no-results message', () => {
        expect(searchAndSort.noResultsMessageIsPresent).to.be.true;
      });

      it('no-results message should indicate completed search', () => {
        expect(searchAndSort.noResultsMessage).to.equal('No results found. Please check your filters.');
      });
    });
  });

  describe('99999 results found', () => {
    setupApplication();
    const searchAndSort = new SearchAndSortInteractor();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      const localProps = {
        isCountHidden: flase,
        parentResources: {
          records: {
            hasLoaded: true,
            other: { totalRecords: 99999 }
          }
        },
      };
      const testProps = Object.assign({}, defaultProps, localProps);

      await mount(
        <ConnectedComponent
          {...testProps}
        />
      );
    });

    it('should show 99,999 records found', () => {
      expect(searchAndSort.resultsSubtitle).to.equal('99,999 records found');
    });

    it('should not display custom pane sub', () => {
      expect(searchAndSort.customPaneSub.isPresent).to.be.false;
    });
  });

  /**
   * Okapi uses a `totalRecords` value of 999,999,999 to indicate
   * an unknown number of totalRecords.
   */
  describe('999999999 results found', () => {
    setupApplication();
    const searchAndSort = new SearchAndSortInteractor();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      const localProps = {
        isCountHidden: flase,
        parentResources: {
          records: {
            hasLoaded: true,
            other: { totalRecords: 999999999 }
          }
        },
      };
      const testProps = Object.assign({}, defaultProps, localProps);

      await mount(
        <ConnectedComponent
          {...testProps}
        />
      );
    });

    it('should show More than 10,000 records found', () => {
      expect(searchAndSort.resultsSubtitle).to.equal('More than 10,000 records found');
    });
  });

  describe('custom label results', () => {
    setupApplication();
    const searchAndSort = new SearchAndSortInteractor();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      const localProps = {
        resultCountMessageKey: 'test-message-id',
      };
      const testProps = Object.assign({}, defaultProps, localProps);

      await mount(<ConnectedComponent {...testProps} />);
    });

    it('should show a custom message', () => {
      expect(searchAndSort.resultsSubtitle).to.equal('test-message-id');
    });
  });

  describe('pristine form messaging', () => {
    setupApplication();
    const searchAndSort = new SearchAndSortInteractor();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      const localProps = {
        isCountHidden: flase,
        parentResources: {
          records: {
            isPending: false,
            hasLoaded: false,
            other: { totalRecords: 0 }
          }
        },
      };
      const testProps = Object.assign({}, defaultProps, localProps);

      await mount(<ConnectedComponent {...testProps} />);
    });

    it('results header should show 0 records found', () => {
      expect(searchAndSort.resultsSubtitle).to.equal('Enter search criteria to start search');
    });

    it('results pane should show no-results message', () => {
      expect(searchAndSort.noResultsMessageIsPresent).to.be.true;
    });

    it('no-results message should indicate pristine form state', () => {
      expect(searchAndSort.noResultsMessage).to.equal('Choose a filter or enter a search query to show results.');
    });
  });

  describe('passing custom pane sub', () => {
    setupApplication();
    const searchAndSort = new SearchAndSortInteractor();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      await mount(<ConnectedComponent {...defaultProps} customPaneSub="Custom pane sub" />);
    });

    it('should display correct custom pane sub', () => {
      expect(searchAndSort.customPaneSub.text).to.equal('Custom pane sub');
    });
  });
});

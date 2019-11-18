import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

import SearchAndSortInteractor from './interactor';
import SearchAndSort from '../SearchAndSort';

describe('SearchAndSort results', () => {
  setupApplication();
  const searchAndSort = new SearchAndSortInteractor();
  const ConnectedComponent = connectStripes(SearchAndSort);

  const defaultProps = {
    initialResultCount: 0,
    resultCountIncrement: 0,
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
        replace: () => { },
      },
    },
    filterConfig: [],
    packageInfo: {
      stripes: {},
      name: 'Search and sort test',
    },
    viewRecordComponent: () => <div />,
  };

  describe('0 records found', () => {
    beforeEach(async () => {
      await mount(
        <ConnectedComponent
          {...defaultProps}
        />
      );
    });

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

  describe('99999 results found', () => {
    beforeEach(async () => {
      const localProps = {
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

    it('should show 99999 records found', () => {
      expect(searchAndSort.resultsSubtitle).to.equal('99,999 records found');
    });
  });

  /**
   * Okapi uses a `totalRecords` value of 999,999,999 to indicate
   * an unknown number of totalRecords.
   */
  describe('999,999,999 results', () => {
    beforeEach(async () => {
      const localProps = {
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

    it('should show "more then 10k records found"', () => {
      expect(searchAndSort.resultsSubtitle).to.equal('More than 10,000 records found');
    });
  });

  describe('custom label results', () => {
    beforeEach(async () => {
      const localProps = {
        resultCountMessageKey: 'test-message-id',
      };
      const testProps = Object.assign({}, defaultProps, localProps);

      await mount(
        <ConnectedComponent
          {...testProps}
        />
      );
    });

    it('should show a custom message', () => {
      expect(searchAndSort.resultsSubtitle).to.equal('test-message-id');
    });
  });

  describe('pristine form messaging', () => {
    beforeEach(async () => {
      const localProps = {
        parentResources: {
          records: {
            isPending: false,
            hasLoaded: false,
            other: { totalRecords: 0 }
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
});

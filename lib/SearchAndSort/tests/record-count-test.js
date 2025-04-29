import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import {
  Pane,
  HTML
} from '@folio/stripes-testing';

import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

import SearchAndSort from '../SearchAndSort';

const SearchAndSortInteractor = HTML.extend('Search and sort')
  .selector('[data-test-search-and-sort]')
  .filters({
    resultsSub: Pane('').subtitle(),
    resultsEmpty: el => !!el.querySelector('[class^=noResultsMessage]'),
    resultsEmptyText: el => el.querySelector('[class^=noResultsMessage]').innerText,
    customSubtitle: el => !!el.querySelector('[data-test-custom-pane-sub]'),
    customSubtitleText: el => el.querySelector('[data-test-custom-pane-sub]').innerText,
  });

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
  const searchAndSort = SearchAndSortInteractor();
  describe('0 records found', () => {
    setupApplication();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      await mount(<ConnectedComponent {...defaultProps} />);
    });

    describe('0 records found', () => {
      it('results header should show 0 records found', () => searchAndSort.has({ resultsSub: '0 records found' }));

      it('no-results message should indicate completed search', () => searchAndSort.has({ resultsEmptyText: 'No results found. Please check your filters.' }));
    });
  });

  describe('99999 results found', () => {
    setupApplication();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      const localProps = {
        isCountHidden: false,
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

    it('should show "99,999 records found"', () => searchAndSort.has({ resultsSub: '99,999 records found' }));

    it('should not display custom pane sub', () => searchAndSort.has({ customSubtitle: false }));
  });

  /**
   * Okapi uses a `totalRecords` value of 999,999,999 to indicate
   * an unknown number of totalRecords.
   */
  describe('999999999 results found', () => {
    setupApplication();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      const localProps = {
        isCountHidden: false,
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

    it('should show More than 10,000 records found', () => searchAndSort.has({ resultsSub: 'More than 10,000 records found' }));
  });

  describe('custom label results', () => {
    setupApplication();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      const localProps = {
        resultCountMessageKey: 'test-message-id',
      };
      const testProps = Object.assign({}, defaultProps, localProps);

      await mount(<ConnectedComponent {...testProps} />);
    });

    it('should show a custom message', () => searchAndSort.has({ resultsSub: 'test-message-id' }));
  });

  describe('pristine form messaging', () => {
    setupApplication();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      const localProps = {
        isCountHidden: false,
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

    it('results header should show 0 records found', () => searchAndSort.has({ resultsSub: 'Enter search criteria to start search' }));

    it('results pane should show no-results message', () => searchAndSort.has({ resultsEmpty: true }));

    it('no-results message should indicate pristine form state', () => searchAndSort.has({ resultsEmptyText: 'Choose a filter or enter a search query to show results.' }));
  });

  describe('passing custom pane sub', () => {
    setupApplication();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      await mount(<ConnectedComponent {...defaultProps} customPaneSub="Custom pane sub" />);
    });

    it('should display correct custom pane sub', () => searchAndSort.has({ customSubtitleText: 'Custom pane sub' }));
  });
});

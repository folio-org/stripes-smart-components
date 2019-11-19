import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

import SearchAndSortInteractor from './interactor';
import SearchAndSort from '../SearchAndSort';

describe('SearchAndSort results', () => {
  describe('0 records found', () => {
    setupApplication();
    const searchAndSort = new SearchAndSortInteractor();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      await mount(
        <ConnectedComponent
          initialResultCount={0}
          resultCountIncrement={0}
          viewRecordPerms="test"
          objectName="user"
          parentResources={{
            records: {
              isPending: false,
              hasLoaded: true,
              other: { totalRecords: 0 }
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

  /**
   * Okapi uses a `totalRecords` value of 999,999,999 to indicate
   * an unknown number of totalRecords.
   */
  describe('99999 results found', () => {
    setupApplication();
    const searchAndSort = new SearchAndSortInteractor();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      await mount(
        <ConnectedComponent
          initialResultCount={0}
          resultCountIncrement={0}
          viewRecordPerms="test"
          objectName="user"
          parentResources={{
            records: {
              hasLoaded: true,
              other: { totalRecords: 99999 }
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

    it('should show 99999 records found', () => {
      expect(searchAndSort.resultsSubtitle).to.equal('99,999 records found');
    });
  });

  describe('custom label results', () => {
    setupApplication();
    const searchAndSort = new SearchAndSortInteractor();
    const ConnectedComponent = connectStripes(SearchAndSort);

    beforeEach(async () => {
      await mount(
        <ConnectedComponent
          initialResultCount={0}
          resultCountIncrement={0}
          viewRecordPerms="test"
          objectName="user"
          parentResources={{
            records: {
              hasLoaded: true,
              other: { totalRecords: 99999 }
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
          resultCountMessageKey="test-message-id"
        />
      );
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
      await mount(
        <ConnectedComponent
          initialResultCount={0}
          resultCountIncrement={0}
          viewRecordPerms="test"
          objectName="user"
          parentResources={{
            records: {
              isPending: false,
              hasLoaded: false,
              other: { totalRecords: 0 }
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

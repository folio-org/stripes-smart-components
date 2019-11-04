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

  describe('0 records', () => {
    beforeEach(() => {
      mount(
        <ConnectedComponent
          initialResultCount={0}
          resultCountIncrement={0}
          viewRecordPerms="test"
          objectName="user"
          parentResources={{
            records: {
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

    it('should show 0 records found', () => {
      expect(searchAndSort.resultsSubtitle).to.equal('0 records found');
    });
  });

  describe('99999 results', () => {
    beforeEach(() => {
      mount(
        <ConnectedComponent
          initialResultCount={0}
          resultCountIncrement={0}
          viewRecordPerms="test"
          objectName="user"
          parentResources={{
            records: {
              hasLoaded: true,
              other: { totalRecords: 99999 },
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

  /**
   * Okapi uses a `totalRecords` value of 999,999,999 to indicate
   * an unknown number of totalRecords.
   */
  describe('999,999,999 results', () => {
    beforeEach(() => {
      mount(
        <ConnectedComponent
          initialResultCount={0}
          resultCountIncrement={0}
          viewRecordPerms="test"
          objectName="user"
          parentResources={{
            records: {
              hasLoaded: true,
              other: { totalRecords: 999999999 },
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

    it('should show "more then 10k records found"', () => {
      expect(searchAndSort.resultsSubtitle).to.equal('More than 10,000 records found');
    });
  });


  describe('custom label results', () => {
    beforeEach(() => {
      mount(
        <ConnectedComponent
          initialResultCount={0}
          resultCountIncrement={0}
          viewRecordPerms="test"
          objectName="user"
          parentResources={{
            records: {
              hasLoaded: true,
              other: { totalRecords: 99999 },
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
});

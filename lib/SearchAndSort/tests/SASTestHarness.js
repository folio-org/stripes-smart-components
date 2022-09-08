import React from 'react';
import PropTypes from 'prop-types';
import { useOkapiKy } from '@folio/stripes-core';
import { Button } from '@folio/stripes-components';
import { useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router';
import queryString from 'query-string';
import SearchAndSort from '../SearchAndSort';
import QueryHarness from '../../../tests/QueryHarness';
import buildUrl from '../buildUrl';

const propTypes = {
  testQindex: PropTypes.string,
  testQindexLabel: PropTypes.node,
  testQuery: PropTypes.string,
  testQueryLabel: PropTypes.node,
  testHomeRoute: PropTypes.string,
};

const SASTestHarness = ({
  testQuery = 'testquery',
  testQindex = 'contributors',
  testQindexLabel = 'nav-qindex',
  testQueryLabel = 'nav-query',
  testHomeRoute = 'dummy',
  ...SASProps
}) => {
  const history = useHistory();
  const location = useLocation();
  const request = useOkapiKy();
  const queryFromLocation = queryString.parse(location.search);
  const { isLoading, isSuccess, isError, error, data } = useQuery(
    ['dummy', queryFromLocation],
    () => {
      return request(buildUrl(location, queryFromLocation, 'samples'), queryFromLocation).json();
    }, {
      // don't fetch an empty query...
      enabled: Object.keys(queryFromLocation).length > 0,
    }
  );

  const parentMutator = {
    query: {
      update: (q) => history.push(buildUrl(location, { queryFromLocation, ...q }, '/dummy')),
      replace: (q) => history.push(buildUrl(location, { q }, '/dummy'))
    },
    resultCount: {
      replace: () => { }
    },
    resultOffset: {
      replace: () => { }
    },
  };

  const parentResources = {
    resultCount: data?.totalCount ? data.totalCount : 0,
    records: {
      records: data?.records,
      isPending: isLoading,
      hasLoaded: isSuccess,
      other: {
        totalRecords: data?.records ? data.records.length : 0,
      },
      failure: isError,
      failureMessaging: error,
    },
  };

  return (
    <QueryHarness>
      <SearchAndSort
        initialResultCount={0}
        resultCountIncrement={0}
        viewRecordPerms="test"
        columnMapping={{}}
        searchableIndexes={[
          { label: 'all', value: 'all' },
          { label: 'contributors', value: 'contributors' },
        ]}
        parentResources={parentResources}
        parentMutator={parentMutator}
        filterConfig={[]}
        packageInfo={{
          stripes: {
            route: testHomeRoute,
          },
          name: 'Search and sort test',
        }}
        objectName="sample"
        renderFilters={() => (
          <>
            <Button
              onClick={() => { history.push(buildUrl(location, { qindex: testQindex }, '/dummy')); }}
            >{testQindexLabel || 'navigate-qindex'}
            </Button>
            <Button
              onClick={() => { history.push(buildUrl(location, { query: testQuery }, '/dummy')); }}
            >{testQueryLabel || 'navigate-query'}
            </Button>
            <h3 id="query-debug">
              search: {location.search}
            </h3>
          </>
        )}
        {...SASProps}
      />
    </QueryHarness>
  );
};

SASTestHarness.propTypes = propTypes;

export default SASTestHarness;

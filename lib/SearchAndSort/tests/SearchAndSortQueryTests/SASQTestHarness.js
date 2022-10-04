import React from 'react';
import PropTypes from 'prop-types';
import { useOkapiKy } from '@folio/stripes-core';
import { Button, SearchField, FilterGroups, MultiColumnList } from '@folio/stripes-components';
import { useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router';
import SearchAndSortQuery from '../../SearchAndSortQuery';
import QueryHarness from '../../../../tests/QueryHarness';
import buildUrl from '../../buildUrl';

const propTypes = {
  testQindex: PropTypes.string,
  testQindexLabel: PropTypes.node,
  testQuery: PropTypes.string,
  testQueryLabel: PropTypes.node,
  testHomeRoute: PropTypes.string,
};

const SASQTestHarness = ({
  testQuery = 'testquery',
  testQindex = 'contributors',
  testQindexLabel = 'nav-qindex',
  testQueryLabel = 'nav-query',
  ...SASQProps
}) => {
  const history = useHistory();
  const location = useLocation();
  const request = useOkapiKy();
  const queryFromLocation = new URLSearchParams(location.search);
  const { data } = useQuery(
    ['dummy', queryFromLocation],
    () => {
      return request(buildUrl(location, queryFromLocation, 'samples'), queryFromLocation).json();
    }, {
    // don't fetch an empty query...
      enabled: Object.keys(queryFromLocation).length > 0,
    }
  );

  const filterConfig = [
    {
      label: 'Status',
      name:'status',
      values:[{
        name: 'active',
        displayName: 'active',
      },
      {
        name: 'inactive',
        displayName: 'inactive',
      }
      ],
    }
  ];

  return (
    <QueryHarness>
      <SearchAndSortQuery
        searchParamsMapping={{
          query: (q) => ({ query: q }),
          qindex: (q) => ({ qindex: q }),
        }}
        {...SASQProps}
      >
        {
          ({
            filterChanged,
            searchChanged,
            sortChanged,
            getSearchHandlers,
            searchValue,
            onSubmitSearch,
            getFilterHandlers,
            onSort,
            activeFilters,
            resetAll,
          }) => {
            const groupFilters = {};
            activeFilters.string.split(',').forEach(m => { groupFilters[m] = true; });
            const resetDisabled = !(filterChanged || searchChanged);
            return (
              <>
                <h3>SearchAndSortQuery Tests</h3>
                <SearchField
                  value={searchValue.query}
                  name="query"
                  onChange={getSearchHandlers().query}
                  indexName="qindex"
                  onChangeIndex={getSearchHandlers().query}
                  searchableIndexes={
                    [
                      { label: 'all', value: 'all' },
                      { label: 'contributors', value: 'contributors' },
                      { label: 'title', value: 'title' }
                    ]}
                  selectedIndex={searchValue.qindex}
                />
                <Button
                  disabled={resetDisabled}
                  onChange={resetAll}
                >
                  Reset all
                </Button>
                <Button buttonStyle="primary" onClick={onSubmitSearch}>
                  Search
                </Button>
                <Button
                  onClick={() => { history.push(buildUrl(location, { qindex: testQindex }, '/dummy')); }}
                >{testQindexLabel || 'navigate-qindex'}
                </Button>
                <Button
                  onClick={() => { history.push(buildUrl(location, { query: testQuery }, '/dummy')); }}
                >{testQueryLabel || 'navigate-query'}
                </Button>
                <Button
                  disabled={!filterChanged}
                  onClick={getFilterHandlers().clear}
                >
                  Clear Filters
                </Button>
                <FilterGroups
                  config={filterConfig}
                  filters={groupFilters}
                  onChangeFilter={getFilterHandlers().checkbox}
                  onClearFilter={getFilterHandlers().clearGroup}
                />
                <Button
                  onClick={() => onSort('test')}
                >
                  Test Sort
                </Button>
                <h3 id="query-debug">
                  search: {location.search}
                </h3>
                <span>testSort: {sortChanged}</span>
                <MultiColumnList contentData={data} />
              </>);
          }
        }
      </SearchAndSortQuery>
    </QueryHarness>
  );
};

SASQTestHarness.propTypes = propTypes;

export default SASQTestHarness;

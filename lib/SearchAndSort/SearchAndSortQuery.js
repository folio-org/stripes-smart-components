import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import queryString from 'query-string';
import { withRouter } from 'react-router';

import {
  mapNsKeys,
  getNsKey,
} from './nsQueryFunctions';

import buildUrl from './buildUrl';

const locationQuerySetter = ({ location, history, nsValues }) => {
  const url = buildUrl(location, nsValues);
  history.push(url);
};

const locationQueryGetter = ({ location }) => {
  return queryString.parse(location.search || '');
};

const defaultStateReducer = (state, nextState) => nextState;

// output is ?filters=name.value,name.value,name.value
const buildFilterString = (activeFilters) => {
  const newFiltersString = Object.keys(activeFilters).map((filterName) => {
    return activeFilters[filterName].map((filterValue) => {
      return `${filterName}.${filterValue}`;
    }).join(',');
  }).join(',');

  return newFiltersString;
};

const filterStringToObject = (str) => {
  const filterObject = {};
  const filterArray = str.split(',');
  filterArray.forEach(f => {
    const filter = f.split('.');
    if (filterObject[filter[0]]) {
      filterObject[filter[0]].push(filter[1]);
    } else {
      filterObject[filter[0]] = [filter[1]];
    }
  });
  return filterObject;
};

const translateKeys = (targetObject, refObject) => {
  let res = {};
  for (const p in refObject) {
    if (Object.prototype.hasOwnProperty.call(targetObject, p)) {
      res = Object.assign(res, refObject[p](targetObject[p]));
    }
  }
  return res;
};

const getQueryStateSlice = (toParse, mapping) => {
  const source = queryString.parse(toParse);
  const state = translateKeys(source, mapping);
  return state;
};

class SearchAndSortQuery extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    filterChangeCallback: PropTypes.func,
    filterParamsMapping: PropTypes.object,
    filtersToString: PropTypes.func,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    initialFilterState: PropTypes.object,
    initialSearch: PropTypes.string,
    initialSearchState: PropTypes.object,
    initialSortState: PropTypes.object,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
    }).isRequired,
    maxSortKeys: PropTypes.number,
    nsParams: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    onComponentWillUnmount: PropTypes.func,
    queryGetter: PropTypes.func,
    querySetter: PropTypes.func,
    queryStateReducer: PropTypes.func,
    searchChangeCallback: PropTypes.func,
    searchParamsMapping: PropTypes.object,
    sortChangeCallback: PropTypes.func,
    sortParamsMapping: PropTypes.object,
    syncToLocationSearch: PropTypes.bool,
  }

  static defaultProps = {
    maxSortKeys: 2,
    filterChangeCallback: noop,
    filtersToString: buildFilterString,
    querySetter: locationQuerySetter,
    queryGetter: locationQueryGetter,
    queryStateReducer: defaultStateReducer,
    searchChangeCallback: noop,
    sortChangeCallback: noop,
    searchParamsMapping: { 'query': v => ({ query : v }) },
    filterParamsMapping: { 'filters': filterStringToObject },
    sortParamsMapping: { 'sort': v => ({ sort: v }) },
    syncToLocationSearch: true,
  }

  constructor(props) {
    super(props);
    this.queryParam = this.queryParam.bind(this);

    // syncToLocationSearch - component will preferably init query state to the window location.
    if (props.syncToLocationSearch) {
      this.initialQuery = props.location.search || '';
    } else {
      this.initialQuery = props.initialSearch || '';
    }

    const defaultQueryState = {
      searchFields: props.initialSearchState || getQueryStateSlice(props.initialSearch, props.searchParamsMapping),
      filterFields: props.initialFilterState || getQueryStateSlice(props.initialSearch, props.filterParamsMapping),
      sortFields: props.initialSortState || getQueryStateSlice(props.initialSearch, props.sortParamsMapping),
    };

    const initialQueryState = {
      /* searchFields will be collected when the user clicks the "Search" button
      *  filterFields are collected on filter change. The conventional shape is { query: <string> }
      */
      searchFields:  getQueryStateSlice(this.initialQuery, props.searchParamsMapping),
      /* filterFields will be applied onChange of any presentational filter control.
      *  The conventional shape is { groupname: [filtername] ... }
      */
      filterFields: getQueryStateSlice(this.initialQuery, props.filterParamsMapping),
      /* sortFields are similar to filterFields. will be applied onChange of any presentational filter control.
      *  The conventional shape is { sort: <string> }
      */
      sortFields:  getQueryStateSlice(this.initialQuery, props.sortParamsMapping),
    };

    // 'reset' functionality can be preserved even if initializing based on a pasted window location.
    const notDefault = !isEqual(initialQueryState, defaultQueryState);

    this.state = {
      ...initialQueryState,
      previousQuery: props.location.search,
      default: defaultQueryState,
      changeType: 'init.reset',
      searchChanged: notDefault,
      filterChanged: notDefault,
      sortChanged: notDefault,
    };
  }

  static getDerivedStateFromProps(props, state) {
    // reset query state if the window location changes to match the initial search...
    // for instance, a user clicks the 'home' link of an app.
    if (props.syncToLocationSearch) {
      let nextState = {};
      // capture previous query...
      if (props.location.search !== state.previousQuery) {
        nextState.lastQuery = props.location.search;
      }
      const queryStateFromLocation = {
        searchFields:  getQueryStateSlice(props.location.search, props.searchParamsMapping),
        filterFields: getQueryStateSlice(props.location.search, props.filterParamsMapping),
        sortFields:  getQueryStateSlice(props.location.search, props.sortParamsMapping),
      };

      if (props.location.search === props.initialSearch &&
        props.location.search !== state.previousQuery
      ) {
        const defaultState = {
          ...queryStateFromLocation,
          changeType: 'init',
          searchChanged: false,
          filterChanged: false,
          sortChanged: false,
        };
        nextState = Object.assign(nextState, defaultState);
      }
      return nextState;
    }

    return null;
  }

  componentDidMount() {
    if (Object.keys(this.state.searchFields).length > 0) {
      this.onSubmitSearch();
    }
  }

  componentWillUnmount() {
    const {
      querySetter,
      onComponentWillUnmount,
      location,
      history,
      nsParams,
    } = this.props;

    // on unmount component should reset the query to its initial state.
    const values = { query: '', qIndex: '', ...this.initialQuery };

    const nsValues = mapNsKeys(values, nsParams);

    querySetter({ location, history, nsValues, values, nsParams, state: this.state });

    if (onComponentWillUnmount) {
      onComponentWillUnmount();
    }
  }

  onChangeSearchState = (stateToSet) => {
    this.internalSetState({ searchFields: stateToSet }, 'search.state');
  }

  onChangeSearchValue = (value, name) => {
    // this.setState({ [fieldName]: query }, () => this.props.searchChangeCallback(query));
    this.internalSetState({ searchFields: { [name]: value } }, 'search.value');
  };

  onChangeSearchEvent = (e) => {
    const query = e.target.value;
    const fieldName = e.target.name;
    // this.setState({ [fieldName]: query }, () => this.props.searchChangeCallback(query));
    this.internalSetState({ searchFields: { [fieldName]: query } }, 'search.event');
  };

  internalSetState = (stateToSet, changeType, callbacks) => {
    const {
      queryStateReducer,
    } = this.props;
    this.setState(curState => {
      const nextState = Object.assign({}, curState, stateToSet);
      nextState.changeType = changeType;
      nextState.searchChanged = !isEqual(
        nextState.searchFields,
        curState.default.searchFields
      );
      nextState.filterChanged = !isEqual(
        nextState.filterFields,
        curState.default.filterFields
      );
      nextState.sortChanged = !isEqual(nextState.sortFields, curState.default.sortFields);
      return queryStateReducer(curState, nextState);
    },
    () => {
      if (callbacks) {
        callbacks.forEach((cb) => {
          cb(this.state);
        });
      }
    });
  }

  onSubmitSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.performSearch(this.state.searchFields);
  };

  // eslint-disable-next-line react/sort-comp
  performSearch = debounce((searchFields) => {
    // this.log('action', `searched for '${searchFields}'`);
    this.transitionToParams({ ...searchFields });
  }, 350);

  onClearSearchFields = () => {
    const { searchChangeCallback } = this.props;
    // this.log('action', 'cleared search');
    this.internalSetState(
      {},
      'search.clear',
      [
        searchChangeCallback
      ]
    );
  };

  onResetSearch = (submit = true) => {
    const submitCallback = submit ? () => { this.onSubmitSearch(); } : noop;
    const { searchChangeCallback } = this.props;
    // this.log('action', 'cleared search');
    this.internalSetState(
      {
        searchFields: this.state.default.searchFields
      },
      'search.reset',
      [
        searchChangeCallback,
        submitCallback
      ]
    );
  }

  onClearSearchAndFilters = () => {
    const {
      filterChangeCallback,
      searchChangeCallback,
      sortChangeCallback
    } = this.props;
    // this.log('action', 'cleared search and filters');
    this.internalChangeState(
      { searchFields: {}, filterFields: {}, sortFields: {} },
      'clear.all',
      [filterChangeCallback, searchChangeCallback, sortChangeCallback]
    );
  };

  resetAll = (submit = true) => {
    const {
      filterChangeCallback,
      searchChangeCallback,
      sortChangeCallback,
    } = this.props;

    const submitCallback = submit ? () => { this.onSubmitSearch(); } : noop;
    // this.log('action', 'cleared search');
    this.internalSetState(
      {
        ...this.state.default
      },
      'reset.all',
      [
        searchChangeCallback,
        filterChangeCallback,
        sortChangeCallback,
        submitCallback
      ]
    );
  }

  onSort = (e, meta) => {
    const { maxSortKeys } = this.props;

    const newOrder = meta.name;
    const oldOrder = this.queryParam('sort');
    const orders = oldOrder ? oldOrder.split(',') : [];
    const mainSort = orders[0];
    const isSameColumn = mainSort && newOrder === mainSort.replace(/^-/, '');

    if (isSameColumn) {
      orders[0] = `-${mainSort}`.replace(/^--/, '');
    } else {
      orders.unshift(newOrder);
    }

    const sortOrder = orders.slice(0, maxSortKeys).join(',');

    // this.log('action', `sorted by ${sortOrder}`);
    this.transitionToParams({ sort: sortOrder });
  };

  transitionToParams = values => {
    const {
      location,
      history,
      nsParams,
      querySetter,
    } = this.props;

    const nsValues = mapNsKeys(values, nsParams);

    /* parent component is in control of actually applying local resource/query updates.
    *  This way this component can work with different means of getting data -
    *  location-based queries, local resource queries, possibly GraphQL...
    */
    querySetter({ location, history, nsValues, values, nsParams, state: this.state });
  };

  queryParam(name) {
    const {
      nsParams,
      queryGetter,
      location,
    } = this.props;
    const nsKey = getNsKey(name, nsParams);
    const query = queryGetter({ location });
    return get(query, nsKey);
  }

  onChangeFilterState = (stateToSet) => {
    this.internalSetState(
      { filterFields: stateToSet },
      'filter.state',
      [
        () => {
          this.applyFilters(this.state.filterFields);
        }
      ]
    );
  }

  onFilterCheckboxChange = (e) => {
    const { filterChangeCallback } = this.props;
    const target = e.target;
    const filterSplit = target.name.split('.');
    const filterName = filterSplit[0];
    const filterValue = filterSplit[1];

    const nextState = cloneDeep(this.state);

    if (nextState.filterFields[filterName]) {
      const itemIndex = nextState.filterFields[filterName].findIndex(i => i === filterValue);
      if (target.checked) {
        if (itemIndex === -1) {
          nextState.filterFields[filterName].push(filterValue);
        }
      } else if (itemIndex !== -1) {
        nextState.filterFields[filterName].splice(itemIndex, 1);
      }
    } else {
      nextState.filterFields[filterName] = [filterValue];
    }

    this.internalSetState(
      nextState,
      'filter.checkbox',
      [
        filterChangeCallback,
        () => {
          this.applyFilters(this.state.filterFields);
        }
      ]
    );
  }

  onClearFilterGroup = (name) => {
    const {
      filterChangeCallback
    } = this.props;

    this.internalSetState(
      {
        filterFields: { [name]: [] }
      },
      'filter.clearGroup',
      [
        filterChangeCallback,
        () => {
          this.applyFilters(this.state.filterFields);
        }
      ]
    );
  }

  onClearFilter = () => {
    const {
      filterChangeCallback
    } = this.props;
    this.internalSetState(
      {
        filterFields: {}
      },
      'filter.clear',
      [
        filterChangeCallback,
        () => {
          this.applyFilters(this.state.filterFields);
        }
      ]
    );
  }

  onResetFilter = () => {
    const {
      filterChangeCallback
    } = this.props;

    this.internalSetState(
      {
        filterFields: this.state.default.filterFields
      },
      'filter.reset',
      [
        filterChangeCallback,
        () => {
          this.applyFilters(this.state.filterFields);
        }
      ]
    );
  }

  applyFilters = (activeFilters) => {
    const newFiltersString = this.props.filtersToString(activeFilters);
    this.transitionToParams({ filters: newFiltersString });
  }

  getActiveFilterState = () => {
    const filtersString = this.queryParam('filters') || '';

    if (filtersString.length === 0) {
      return undefined;
    }

    return filtersString
      .split(',')
      .reduce((resultFilters, currentFilter) => {
        const [filterName, filterValue] = currentFilter.split('.');

        if (!Array.isArray(resultFilters[filterName])) {
          resultFilters[filterName] = [];
        }

        resultFilters[filterName].push(filterValue);

        return resultFilters;
      }, {});
  }

  getFilterChangeHandlers = () => ({
    state: this.onChangeFilterState,
    checkbox: this.onFilterCheckboxChange,
    clear: this.onClearFilter,
    clearGroup: this.onClearFilterGroup,
    reset: this.onResetFilter,
  });

  getActiveFilters = () => ({
    state: this.state.filterFields,
    string: this.props.filtersToString(this.state.filterFields),
  });

  getSearchChangeHandlers = () => ({
    state: this.onChangeSearchState,
    query: this.onChangeSearchEvent,
    clear: this.onClearSearchFields,
    reset: this.onResetSearch,
  });

  render() {
    const { children } = this.props;

    return children({
      filterChanged: this.state.filterChanged,
      searchChanged: this.state.searchChanged,
      sortChanged: this.state.sortChanged,
      getSearchHandlers: this.getSearchChangeHandlers,
      searchValue: this.state.searchFields,
      onSubmitSearch: this.onSubmitSearch,
      getFilterHandlers: this.getFilterChangeHandlers,
      onSort: this.onSort,
      activeFilters: this.getActiveFilters(),
      resetAll: this.resetAll,
    });
  }
}

export default withRouter(SearchAndSortQuery);

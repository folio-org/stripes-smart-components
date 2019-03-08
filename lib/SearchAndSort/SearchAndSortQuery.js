import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import get from 'lodash/get';
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

class SearchAndSortQuery extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    filterChangeCallback: PropTypes.func,
    filtersToString: PropTypes.func,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    initialSearch: PropTypes.string,
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
    sortChangeCallback: PropTypes.func,
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
  }

  constructor(props) {
    super(props);

    this.initialQuery = queryString.parse(props.initialSearch);
    this.initialFilters = this.initialQuery.filters;
    this.queryParam = this.queryParam.bind(this);

    /* searchFields will be collected when the user clicks the "Search" button
    *  filterFields are collected on filter change.
    */
    this.state = {
      searchFields: {
      },
      filterFields: {
      },
      sortFields: {
      }
    };
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

    querySetter({ location, history, nsValues, values, nsParams });

    if (onComponentWillUnmount) {
      onComponentWillUnmount();
    }
  }

  onChangeSearchState = (stateToSet) => {
    this.internalSetState(stateToSet, 'search');
  }

  onChangeSearchValue = (value, name) => {
    // this.setState({ [fieldName]: query }, () => this.props.searchChangeCallback(query));
    this.internalSetState({ [name]: value }, 'search');
  };

  onChangeSearchEvent = (e) => {
    const query = e.target.value;
    const fieldName = e.target.name;
    // this.setState({ [fieldName]: query }, () => this.props.searchChangeCallback(query));
    this.internalSetState({ [fieldName]: query }, 'search');
  };

  internalSetState = (stateToSet, changeType, callbacks) => {
    const {
      queryStateReducer,
    } = this.props;
    this.setState(curState => {
      let nextState = cloneDeep(curState);
      switch (changeType) {
        case 'search':
          nextState.searchFields = Object.assign({}, curState.searchFields, stateToSet);
          break;
        case 'filter':
          nextState.filterFields = Object.assign({}, curState.filterFields, stateToSet);
          break;
        case 'sort':
          nextState.filterFields = Object.assign({}, curState.filterFields, stateToSet);
          break;
        case 'clear':
          nextState = Object.assign({}, curState, stateToSet);
          break;
        default:
          nextState = Object.assign({}, curState, stateToSet);
      }
      nextState.changeType = changeType;
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
    e.preventDefault();
    e.stopPropagation();

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
      'search',
      [
        (state) => {
          this.transitionToParams({ ...state.searchFields });
        },
        searchChangeCallback
      ]
    );
    // This allows the parent to reset other parameters like query index to
    // something that it may prefer instead of an empty qindex.
    // this.props.filterChangeCallback({});
  };

  onClearSearchAndFilters = () => {
    const {
      filterChangeCallback,
      searchChangeCallback,
      sortChangeCallback
    } = this.props;
    // this.log('action', 'cleared search and filters');
    this.internalChangeState(
      { searchFields: {}, filterFields: {}, sortFields: {} },
      'clear',
      [filterChangeCallback, searchChangeCallback, sortChangeCallback]
    );
  };

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
      stateToSet,
      'filter',
      [
        () => {
          this.applyFilters(this.state.filterFields);
        }
      ]
    );
  }

  onFilterCheckboxChange = (e) => {
    const target = e.target;
    const filterSplit = target.name.split('.');
    const filterName = filterSplit[0];
    const filterValue = filterSplit[1];

    this.setState((curState) => {
      const nextState = cloneDeep(curState);

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

      return nextState;
    }, () => {
      this.applyFilters(this.state.filterFields);
    });
  }

  // custom filter handlers
  /* onFilterChange = ({ name, values }) => {
    this.setState((prevState) => ({
      activeFilters: {
        ...prevState.activeFilters,
        [name]: values,
      }
    }), () => {
      this.applyFilters(this.state.filterFields);
    });
  }
*/

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
    clear: this.onClearSearchAndFilter
  });

  getActiveFilters = () => ({
    state: this.state.filterFields,
    string: this.props.filtersToString(this.state.filterFields),
  });

  getSearchChangeHandlers = () => ({
    state: this.onChangeSearchState,
    query: this.onChangeSearchEvent,
  });

  render() {
    const { children } = this.props;

    return children({
      getSearchHandlers: this.getSearchChangeHandlers,
      searchValue: this.state.searchFields,
      onSubmitSearch: this.onSubmitSearch,
      onClearSearch: this.onClearSearch,
      getFilterHandlers: this.getFilterChangeHandlers,
      onSort: this.onSort,
      activeFilters: this.getActiveFilters(),
    });
  }
}

export default withRouter(SearchAndSortQuery);

// A generalisation of the search-and-sort functionality that underlies searching-and-sorting modules

// NOTE: modules using this with react-apollo MUST set errorPolicy: 'all' for Apollo.

import React from 'react';
import PropTypes from 'prop-types';
import {
  Link,
  Route,
} from 'react-router-dom';
import { withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';
import {
  includes,
  debounce,
  get,
  isMatch,
  upperFirst,
  noop,
  isEmpty,
  defer,
  omit,
} from 'lodash';

import {
  Button,
  FilterGroups,
  Layer,
  MultiColumnList,
  Pane,
  PaneMenu,
  SearchField,
  SRStatus,
  filterState,
  handleFilterChange,
  handleFilterClear,
  AdvancedSearch,
} from '@folio/stripes-components';

import {
  AppIcon,
  IntlConsumer,
  IfPermission,
  withModule,
  withNamespace,
  withStripes,
} from '@folio/stripes-core';

import {
  mapNsKeys,
  getNsKey,
} from './nsQueryFunctions';
import makeConnectedSource from './ConnectedSource';
import Tags from '../Tags';
import {
  NoResultsMessage,
  ResetButton,
  CollapseFilterPaneButton,
  ExpandFilterPaneButton,
} from './components';
import { ColumnManager } from '../ColumnManager';
import PersistedPaneset from '../PersistedPaneset';

import buildUrl from './buildUrl';
import advancedSearchQueryToRows from './advancedSearchQueryToRows';

import css from './SearchAndSort.css';

const NO_PERMISSION_NODE = (
  <div
    style={{
      position: 'absolute',
      right: '1rem',
      bottom: '1rem',
      width: '34%',
      zIndex: '9999',
      padding: '1rem',
      backgroundColor: '#fff',
    }}
  >
    <h2><FormattedMessage id="stripes-smart-components.permissionError" /></h2>
    <p><FormattedMessage id="stripes-smart-components.permissionsDoNotAllowAccess" /></p>
  </div>
);

const queryParam = (name, props) => {
  const {
    parentResources: { query },
    nsParams,
  } = props;
  const nsKey = getNsKey(name, nsParams);

  return get(query, nsKey);
};

class SearchAndSort extends React.Component {
  static propTypes = {
    actionMenu: PropTypes.func, // parameter properties provided by caller
    advancedSearchIndex: PropTypes.string,
    advancedSearchOptions: PropTypes.arrayOf(PropTypes.object),
    advancedSearchQueryBuilder: PropTypes.func,
    apolloQuery: PropTypes.object, // machine-readable
    apolloResource: PropTypes.string,
    autofocusSearchField: PropTypes.bool,
    basePath: PropTypes.string,
    browseOnly: PropTypes.bool,
    pagingCanGoNext: PropTypes.bool,
    pagingCanGoPrevious: PropTypes.bool,
    paneTitleRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    columnManagerProps: PropTypes.object,
    columnMapping: PropTypes.object,
    columnWidths: PropTypes.object,
    createRecordPath: PropTypes.string,
    customPaneSub: PropTypes.node,
    customPaneSubText: PropTypes.node,
    detailProps: PropTypes.object,
    disableFilters: PropTypes.object,
    disableRecordCreation: PropTypes.bool,
    editRecordComponent: PropTypes.func,
    extraParamsToReset: PropTypes.object,
    filterChangeCallback: PropTypes.func,
    filterConfig: PropTypes.arrayOf(
      PropTypes.shape({
        cql: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired,
        name: PropTypes.string.isRequired,
        values: PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
              cql: PropTypes.string.isRequired,
              name: PropTypes.string.isRequired,
            }),
          ]),
        ).isRequired,
      }),
    ),
    finishedResourceName: PropTypes.string,
    getCellClass: PropTypes.func,
    getHelperComponent: PropTypes.func,
    getHelperResourcePath: PropTypes.func,
    hasNewButton: PropTypes.bool,
    hasRowClickHandlers: PropTypes.bool,
    hidePageIndices: PropTypes.bool,
    history: PropTypes.shape({ // provided by withRouter
      push: PropTypes.func.isRequired,
    }).isRequired,
    indexRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    ]),
    initialFilters: PropTypes.string,
    initialResultCount: PropTypes.number.isRequired,
    initiallySelectedRecord: PropTypes.string,
    inputRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    ]),
    inputType: PropTypes.string,
    isCountHidden: PropTypes.bool,
    isCursorAtEnd: PropTypes.bool,
    location: PropTypes.shape({ // provided by withRouter
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
    }).isRequired,
    massageNewRecord: PropTypes.func,
    match: PropTypes.shape({ // provided by withRouter
      path: PropTypes.string.isRequired,
    }).isRequired,
    maxSortKeys: PropTypes.number,
    module: PropTypes.shape({ // values specified by the ModulesContext
      displayName: PropTypes.node, // human-readable
    }),
    namespace: PropTypes.string.isRequired,
    newRecordInitialValues: PropTypes.object,
    newRecordPerms: PropTypes.string,
    notLoadedMessage: PropTypes.element,
    nonInteractiveHeaders: PropTypes.arrayOf(PropTypes.string),
    nsParams: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    objectName: PropTypes.string.isRequired,
    onChangeIndex: PropTypes.func,
    onCloseNewRecord: PropTypes.func,
    onComponentWillUnmount: PropTypes.func,
    onCreate: PropTypes.func,
    onDismissDetail: PropTypes.func,
    onFilterChange: PropTypes.func,
    onResetAll: PropTypes.func,
    onSubmitSearch: PropTypes.func,
    onSelectRow: PropTypes.func,
    packageInfo: PropTypes.shape({ // values pulled from the provider's package.json config object
      initialFilters: PropTypes.string, // default filters
      moduleName: PropTypes.string, // machine-readable, for HTML ids and translation keys
      name: PropTypes.string,
      stripes: PropTypes.shape({
        route: PropTypes.string, // base route; used to construct URLs
        type: PropTypes.string,
      }).isRequired,
    }),
    pageAmount: PropTypes.number,
    pagingType: PropTypes.string,
    parentData: PropTypes.object,
    parentMutator: PropTypes.shape({
      query: PropTypes.shape({
        replace: PropTypes.func.isRequired,
        update: PropTypes.func.isRequired,
      }),
      resultCount: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
      resultOffset: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
    }).isRequired,
    parentResources: PropTypes.shape({
      query: PropTypes.shape({
        filters: PropTypes.string,
        notes: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.bool,
        ]),
        browsePoint: PropTypes.string,
      }),
      records: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        isPending: PropTypes.bool,
        other: PropTypes.shape({
          totalRecords: PropTypes.number.isRequired,
        }),
        successfulMutations: PropTypes.arrayOf(
          PropTypes.shape({
            record: PropTypes.shape({
              id: PropTypes.string.isRequired,
            }).isRequired,
          }),
        ),
      }),
      resultCount: PropTypes.number,
    }).isRequired,
    path: PropTypes.string,
    queryFunction: PropTypes.func,
    renderFilters: PropTypes.func,
    renderNavigation: PropTypes.func,
    resultCountIncrement: PropTypes.number.isRequired,
    resultCountMessageKey: PropTypes.string,
    resultRowFormatter: PropTypes.func,
    resultRowIsSelected: PropTypes.func,
    resultsCachedPosition: PropTypes.object,
    resultsFormatter: PropTypes.shape({}),
    resultsKey: PropTypes.string,
    resultsOnMarkPosition: PropTypes.func,
    resultsOnNeedMore: PropTypes.func,
    resultsOnResetMarkedPosition: PropTypes.func,
    resultsStickyFirstColumn: PropTypes.bool,
    resultsStickyLastColumn: PropTypes.bool,
    resultsVirtualize: PropTypes.bool,
    searchableIndexes: PropTypes.arrayOf(PropTypes.object),
    searchableIndexesPlaceholder: PropTypes.string,
    searchFieldButtonLabel: PropTypes.node,
    selectedIndex: PropTypes.string,
    showSingleResult: PropTypes.bool, // whether to auto-show the details record when a search returns a single row
    sortableColumns: PropTypes.arrayOf(PropTypes.string),
    stripes: PropTypes.shape({
      connect: PropTypes.func,
      hasPerm: PropTypes.func.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func,
      }),
    }).isRequired,
    syncQueryWithUrl: PropTypes.bool,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    validateSearchOnSubmit: PropTypes.func, // should return bool. It prevents search submission on false
    viewRecordComponent: PropTypes.func,
    viewRecordPathById: PropTypes.func,
    viewRecordPerms: PropTypes.string.isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    autofocusSearchField: true,
    advancedSearchIndex: 'advancedSearch',
    advancedSearchOptions: [],
    columnManagerProps: {},
    customPaneSub: null,
    showSingleResult: false,
    maxSortKeys: 2,
    onComponentWillUnmount: noop,
    onResetAll: noop,
    extraParamsToReset: {},
    filterChangeCallback: noop,
    getHelperComponent: noop,
    massageNewRecord: noop,
    renderNavigation: noop,
    hasRowClickHandlers: true,
    selectedIndex: '',
    syncQueryWithUrl: false,
    hasNewButton: true,
    isCountHidden: false,
    resultRowIsSelected: ({ item, criteria }) => {
      if (criteria) {
        return isMatch(item, criteria);
      }
      return false;
    }
  };

  constructor(props) {
    super(props);

    const {
      viewRecordComponent,
      stripes,
    } = props;

    // Use local storage to remember whether the filter pane has been toggled off or not.
    this.filterPaneVisibilityKey = `${props.namespace}/filterPaneVisibility`;
    const storedFilterPaneState = JSON.parse(window.localStorage.getItem(this.filterPaneVisibilityKey));

    this.state = {
      selectedItem: this.initiallySelectedRecord,
      filterPaneIsVisible: storedFilterPaneState === null ? true : !!storedFilterPaneState,
      locallyChangedSearchTerm: '',
      locallyChangedQueryIndex: '',
      // eslint didn't learn about gDSFP 7.26.x; see ESCONF-21.
      // eslint-disable-next-line react/no-unused-state
      previousQueryString: '',
      isAdvancedSearchOpen: false,
    };

    this.handleFilterChange = handleFilterChange.bind(this);
    this.handleFilterClear = handleFilterClear.bind(this);
    if (viewRecordComponent) this.connectedViewRecord = stripes.connect(viewRecordComponent);

    this.helperApps = {
      tags: stripes.connect(Tags)
    };

    this.SRStatus = null;
    this.lastNonNullResultCount = undefined;
    this.initialQuery = queryString.parse(this.initialSearch);
    this.initialFilters = this.initialQuery.filters;
    this.initialSort = this.initialQuery.sort;

    const logger = stripes.logger;

    this.log = logger.log.bind(logger);
  }


  // State is an interstitial holder of data of props when the ui needs to be synced accordingly,
  // but only certain user interactions will sync the changes with the internal state, internal state
  // from the query will only need to be updated when the browsers' query string changes.
  // Ex: the `query` parameter in of window.location - the ui should sync to any query parameter change that happens,
  // but the changes to local state/the search field will not reach the window.location until the search is submitted,
  // so we derive state from props...
  static getDerivedStateFromProps = (props, state) => {
    const {
      location: {
        search
      },
      searchableIndexes,
    } = props;

    const nextState = {};

    if (search !== state.previousQueryString) {
      nextState.previousQueryString = search;
      const parsedQuery = queryString.parse(search);

      // if the search hasn't been changed by the user,
      // sync it to the query string...
      if (parsedQuery?.query !== queryString.parse(state.previousQueryString)?.query) {
        nextState.locallyChangedSearchTerm = parsedQuery.query;
      }

      // sync qindex...
      // if no 'qindex' parameter is present in window.location, keep or reset the local qIndex:
      if (parsedQuery?.qindex) {
        nextState.locallyChangedQueryIndex = parsedQuery.qindex;
      } else if (searchableIndexes) {
        const hasSuchQueryIndexInSegment = searchableIndexes.some(({ value }) => value === state.locallyChangedQueryIndex);
        nextState.locallyChangedQueryIndex = hasSuchQueryIndexInSegment ? state.locallyChangedQueryIndex : '';
      } else {
        nextState.locallyChangedQueryIndex = state.locallyChangedQueryIndex || '';
      }
    }

    if (Object.keys(nextState).length > 0) return nextState;
    return null;
  }

  componentDidUpdate(prevProps) {
    const {
      showSingleResult,
      finishedResourceName,
      stripes: { logger },
      location,
    } = this.props;

    const previousState = makeConnectedSource(prevProps, logger);
    const currentState = makeConnectedSource(this.props, logger);

    const recordId = location.pathname.split('/')[3];

    // if the results list is winnowed down to a single record, display the record.
    // If there's a single hit, open the detail pane as side-effect.
    const totalCountResult = currentState.totalCount();
    if (showSingleResult &&
      totalCountResult === 1 &&
      // Check for the absence of record ID in the URL to prevent the record from being automatically opened when
      // a user navigates from another route to `../view/:id`. The record will be open in any case.
      // Otherwise, the previously open record replaces the newly created one.
      !recordId &&
      (this.lastNonNullResultCount > 1 || (previousState.records()[0] !== currentState.records()[0]))) {
      this.onSelectRow(null, currentState.records()[0]);
    }

    this.lastNonNullResultCount = totalCountResult ?? this.lastNonNullResultCount;

    // If a search that was pending is now complete, notify the screen-reader as side-effect.
    if (previousState.pending() && !currentState.pending()) {
      this.log('event', 'new search-result');

      this.SRStatus.sendMessage(
        <FormattedMessage id="stripes-smart-components.searchReturnedResults" values={{ count: totalCountResult }} />
      );
    }

    // If the nominated mutation has finished, select the newly created record as side-effect.
    const oldStateForFinalSource = makeConnectedSource(prevProps, logger, finishedResourceName);
    const newStateForFinalSource = makeConnectedSource(this.props, logger, finishedResourceName);

    if (oldStateForFinalSource.records()) {
      const finishedResourceNextSM = newStateForFinalSource.successfulMutations();

      if (finishedResourceNextSM.length > oldStateForFinalSource.successfulMutations().length) {
        if (currentState.successfulMutations()[0]) {
          this.onSelectRow(undefined, { id: currentState.successfulMutations()[0].record.id });
        }
      }
    }

    if (prevProps.initiallySelectedRecord !== this.props.initiallySelectedRecord) {
      this.setState({ selectedItem: this.initiallySelectedRecord });
    }
  }

  componentWillUnmount() {
    const {
      parentMutator: { query },
      onComponentWillUnmount,
    } = this.props;

    if (this.isPluginMode()) {
      query.replace(this.initialQuery);
    }
    onComponentWillUnmount(this.props);
  }

  isPluginMode() {
    const {
      packageInfo: {
        stripes: {
          type,
        },
      },
    } = this.props;

    return type === 'plugin';
  }

  get initiallySelectedRecord() {
    const {
      location: { pathname },
      initiallySelectedRecord,
    } = this.props;

    const match = pathname.match(/^\/.*\/view\/(.*)$/);
    const recordId = (match && match[1]) || initiallySelectedRecord;

    return { id: recordId };
  }

  get initialSearch() {
    const { packageInfo: { stripes } } = this.props;
    const initialPath = get(stripes, 'home') || get(stripes, 'route') || '';

    return initialPath.indexOf('?') === -1
      ? initialPath
      : initialPath.substr(initialPath.indexOf('?') + 1);
  }

  craftLayerUrl = (mode) => {
    const {
      pathname,
      search,
    } = this.props.location;

    const url = `${pathname}${search}`;

    return `${url}${url.includes('?') ? '&' : '?'}layer=${mode}`;
  };

  onFilterChangeHandler = (filter) => {
    const {
      parentMutator: {
        resultCount,
        resultOffset,
        query,
      },
      initialResultCount,
      onFilterChange,
    } = this.props;
    const { locallyChangedSearchTerm } = this.state;

    resultCount.replace(initialResultCount);

    if (resultOffset) {
      resultOffset.replace(0);
    }

    query.update({ query: locallyChangedSearchTerm });

    // use next tick in order to wait for the resource query to update
    defer(() => onFilterChange(filter));
  };

  onChangeSearch = (e) => {
    const query = e.target.value;

    if (query) {
      this.setState({ locallyChangedSearchTerm: query });
    } else {
      // defer to avoid delay on keyup when the last character is removed
      defer(() => this.onClearSearchQuery());
    }
  };

  onChangeIndex = (e, args) => {
    this.setState({ locallyChangedQueryIndex: e.target.value });

    if (this.props.onChangeIndex) {
      this.props.onChangeIndex(e, args);
    }
  }

  onSubmitSearch = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const {
      onSubmitSearch,
      validateSearchOnSubmit,
      extraParamsToReset,
    } = this.props;
    const {
      locallyChangedSearchTerm,
      locallyChangedQueryIndex,
    } = this.state;
    const qindex = locallyChangedQueryIndex || this.props.selectedIndex;

    if (onSubmitSearch) {
      onSubmitSearch();
    }

    if (validateSearchOnSubmit && !validateSearchOnSubmit(locallyChangedSearchTerm)) {
      return;
    }

    this.performSearch({
      query: locallyChangedSearchTerm,
      qindex,
      ...extraParamsToReset,
    });
  };

  onChangeFilter = (e) => {
    const {
      parentMutator: { resultCount, resultOffset },
      initialResultCount,
      filterChangeCallback,
    } = this.props;

    resultCount.replace(initialResultCount);

    if (resultOffset) {
      resultOffset.replace(0);
    }

    const newFilters = this.handleFilterChange(e);

    filterChangeCallback(newFilters);
  };

  onClearFilter = (e) => {
    const newFilters = this.handleFilterClear(e);

    this.props.filterChangeCallback(newFilters);
  };

  resetLocallyChangedQuery = (cb = noop) => {
    this.setState({
      locallyChangedSearchTerm: '',
      locallyChangedQueryIndex: '',
    }, cb);
  }

  onClearSearchAndFilters = () => {
    const {
      extraParamsToReset,
    } = this.props;
    this.log('action', 'cleared search and filters');

    this.transitionToParams({
      filters: this.initialFilters || '',
      sort: this.initialSort || '',
      query: '',
      qindex: '',
      ...extraParamsToReset,
    });
    this.resetLocallyChangedQuery();
    this.props.filterChangeCallback({});
    this.props.onResetAll();
  };

  onClearSearchQuery = () => {
    const {
      extraParamsToReset,
    } = this.props;
    this.log('action', 'cleared search query');
    this.setState({ locallyChangedSearchTerm: '' });
    this.transitionToParams({ query: '', ...extraParamsToReset });
  };

  onCloseEdit = (e) => {
    if (e) {
      e.preventDefault();
    }

    this.log('action', 'clicked "close edit"');
    this.transitionToParams({ layer: null });
  };

  onEdit = (e) => {
    if (e) {
      e.preventDefault();
    }

    this.log('action', 'clicked "edit"');
    this.transitionToParams({ layer: 'edit' });
  };

  transitionToParams = values => {
    const {
      location,
      history,
      nsParams,
      browseOnly,
      basePath,
      parentMutator: { query },
    } = this.props;

    const nsValues = mapNsKeys(values, nsParams);
    const url = buildUrl(location, nsValues, basePath);

    // react-router doesn't work well with our 'plugin' setup
    // so unfortunately we still have to rely on query resource
    // in those cases.
    if (browseOnly) {
      query.update(nsValues);
    } else {
      history.push(url);
    }
  };

  onNeedMore = (askAmount, index, firstIndex, direction) => {
    const {
      parentMutator: { resultOffset },
      stripes: { logger },
      resultCountIncrement,
      resultsOnNeedMore
    } = this.props;
    const source = makeConnectedSource(this.props, logger);

    if (resultsOnNeedMore) {
      const records = source.records();

      resultsOnNeedMore({ records, source, direction, index, firstIndex, askAmount });
    } else if (resultOffset && index >= 0) {
      // If module provides offset mutator and index parameter, opt-in to fetch by offset.
      source.fetchOffset(index);
    } else {
      source.fetchMore(resultCountIncrement);
    }
  };

  onSelectRow = (e, meta) => {
    const {
      onSelectRow,
      packageInfo,
    } = this.props;

    if (onSelectRow) {
      const shouldFallBackToRegularRecordDisplay = onSelectRow(e, meta);

      if (!shouldFallBackToRegularRecordDisplay) {
        return;
      }
    }

    this.log('action', `clicked ${meta.id}, selected record =`, meta);
    this.setState({ selectedItem: meta });
    this.transitionToParams({ _path: `${packageInfo.stripes.route}/view/${meta.id}` });
  };

  onSort = (e, meta) => {
    const {
      parentMutator: { resultCount, resultOffset },
      initialResultCount,
      maxSortKeys,
      sortableColumns
    } = this.props;

    const newOrder = meta.name;

    if (sortableColumns && !includes(sortableColumns, newOrder)) return;

    const oldOrder = queryParam('sort', this.props);
    const orders = oldOrder ? oldOrder.split(',') : [];
    const mainSort = orders[0];
    const isSameColumn = mainSort && newOrder === mainSort.replace(/^-/, '');

    if (isSameColumn) {
      orders[0] = `-${mainSort}`.replace(/^--/, '');
    } else {
      orders.unshift(newOrder);
    }

    const sortOrder = orders.slice(0, maxSortKeys).join(',');

    this.log('action', `sorted by ${sortOrder}`);
    // Reset result count when sorting so that only 1 page is initially retrieved
    resultCount.replace(initialResultCount);

    if (resultOffset) {
      resultOffset.replace(0);
    }

    this.transitionToParams({ sort: sortOrder });
  };

  getRowURL(id) {
    const {
      match: { path },
      location: { search },
    } = this.props;

    return `${path}/view/${id}${search}`;
  }

  addNewRecord = (e) => {
    if (e) {
      e.preventDefault();
    }

    this.log('action', 'clicked "add new record"');
    this.transitionToParams({ layer: 'create' });
  };

  // custom row formatter to wrap rows in anchor tags.
  anchoredRowFormatter = (row) => {
    const {
      rowIndex,
      rowClass,
      rowData,
      cells,
      rowProps,
      labelStrings
    } = row;
    const label = labelStrings && labelStrings.join('...');

    return (
      <div
        role="row"
        aria-rowindex={rowIndex + 2}
        key={`row-${rowIndex}`}
      >
        {this.props.viewRecordPathById
          ?
            <Link
              to={this.props.viewRecordPathById(rowData.id)}
              data-label={label}
              className={rowClass}
              {...omit(rowProps, 'onClick')}
            >
              {cells}
            </Link>
          :
            <a
              href={this.getRowURL(rowData.id)}
              data-label={label}
              className={rowClass}
              {...rowProps}
            >
              {cells}
            </a>
        }
      </div>
    );
  };

  closeNewRecord = (e) => {
    this.log('action', 'clicked "close new record"');
    if (this.props.onCloseNewRecord) {
      this.props.onCloseNewRecord(e);
    } else {
      if (e) {
        e.preventDefault();
      }

      this.transitionToParams({ layer: null });
    }
  };

  resetSelectedItem = () => {
    this.setState({ selectedItem: undefined });
  };

  collapseDetails = () => {
    const {
      packageInfo: { stripes },
      onDismissDetail,
    } = this.props;

    if (onDismissDetail) {
      onDismissDetail(this.resetSelectedItem);
    } else {
      this.resetSelectedItem();
    }

    this.transitionToParams({ _path: `${stripes.route}/view` });
  };

  createRecord(record) {
    const {
      massageNewRecord,
      onCreate,
    } = this.props;

    massageNewRecord(record);

    return onCreate(record);
  }

  // eslint-disable-next-line react/sort-comp
  performSearch = debounce((queryParams) => {
    const {
      parentMutator: { resultCount, resultOffset },
      initialResultCount,
    } = this.props;

    this.log('action', `searched for '${queryParams.query}'`);
    resultCount.replace(initialResultCount);

    if (resultOffset) {
      resultOffset.replace(0);
    }

    this.transitionToParams(queryParams);
  }, 350);

  toggleFilterPane = () => {
    this.setState(prevState => ({ filterPaneIsVisible: !prevState.filterPaneIsVisible }), () => {
      window.localStorage.setItem(this.filterPaneVisibilityKey, this.state.filterPaneIsVisible);
    });
  };

  toggleHelperApp = (curHelper) => {
    const prevHelper = queryParam('helper', this.props);
    const helper = prevHelper === curHelper ? null : curHelper;

    this.transitionToParams({ helper });
  };

  toggleTags = () => this.toggleHelperApp('tags');

  getModuleName() {
    const { packageInfo: { name } } = this.props;

    return name.replace(/.*\//, '');
  }

  isResetButtonDisabled() {
    const initialFilters = this.initialFilters || '';
    const currentFilters = queryParam('filters', this.props) || '';
    const noFiltersChoosen = currentFilters === initialFilters;
    const currentQuery = queryParam('query', this.props);
    const searchTermFieldIsEmpty = isEmpty(this.state.locallyChangedSearchTerm || currentQuery);

    return noFiltersChoosen && searchTermFieldIsEmpty;
  }

  renderResetButton = (resetRows = noop) => {
    const { advancedSearchOptions } = this.props;

    return (
      <ResetButton
        id="clickable-reset-all"
        rootClassName={css.resetButton}
        fullWidth
        label={<FormattedMessage id="stripes-smart-components.resetAll" />}
        disabled={this.isResetButtonDisabled()}
        marginBottom0={Boolean(advancedSearchOptions.length)}
        onClick={() => {
          resetRows();
          this.onClearSearchAndFilters();
        }}
      />
    );
  };

  renderAdvancedSearch = () => {
    const {
      selectedIndex,
      advancedSearchOptions,
      advancedSearchQueryBuilder,
    } = this.props;
    const {
      locallyChangedSearchTerm,
      locallyChangedQueryIndex,
      isAdvancedSearchOpen,
    } = this.state;

    const query = queryParam('query', this.props) || '';
    const searchTerm = locallyChangedSearchTerm || query;
    const queryIndex = locallyChangedQueryIndex || selectedIndex;

    const advancedSearchDefaultSearch = {
      query: searchTerm,
      option: queryIndex,
    };

    return (
      <AdvancedSearch
        open={isAdvancedSearchOpen}
        searchOptions={advancedSearchOptions}
        defaultSearchOptionValue={advancedSearchOptions[0]?.value}
        firstRowInitialSearch={advancedSearchDefaultSearch}
        onSearch={this.handleAdvancedSearch}
        onCancel={() => this.setState({ isAdvancedSearchOpen: false })}
        queryBuilder={advancedSearchQueryBuilder}
        queryToRow={(row) => advancedSearchQueryToRows(row.query)}
        hasQueryOption={false}
      >
        {({ resetRows }) => (
          <div className={css.resetAndAdvancedSearchWrapper}>
            {this.renderResetButton(resetRows)}
            {this.renderAdvancedSearchButton()}
          </div>
        )}
      </AdvancedSearch>
    );
  };

  renderAdvancedSearchButton = () => {
    return (
      <Button
        id="clickable-advanced-search"
        fullWidth
        onClick={() => this.setState({ isAdvancedSearchOpen: true })}
        buttonClass={css.advancedSearchButton}
      >
        <FormattedMessage id="stripes-smart-components.advancedSearch" />
      </Button>
    );
  };

  getHelperComponent(helperName) {
    return this.props.getHelperComponent(helperName) ||
      this.helperApps[helperName];
  }

  renderHelperApp() {
    const {
      stripes,
      match,
      getHelperResourcePath,
    } = this.props;

    const moduleName = this.getModuleName();
    const helper = queryParam('helper', this.props);
    const HelperAppComponent = this.getHelperComponent(helper);

    if (!HelperAppComponent) {
      return null;
    }

    return (
      <Route
        path={`${match.path}/view/:id`}
        render={
          props => {
            const { match: { params } } = props;
            const link = getHelperResourcePath
              ? getHelperResourcePath(helper, params.id)
              : `${moduleName}/${params.id}`;

            return (
              <HelperAppComponent
                stripes={stripes}
                link={link}
                onToggle={() => this.toggleHelperApp(helper)}
                {...props}
              />
            );
          }
        }
      />
    );
  }

  renderNewRecordBtn() {
    const {
      objectName,
      disableRecordCreation,
      newRecordPerms,
      createRecordPath,
    } = this.props;

    if (disableRecordCreation || !newRecordPerms) {
      return null;
    }

    return (
      <IfPermission perm={newRecordPerms}>
        <PaneMenu>
          <FormattedMessage id="stripes-smart-components.addNew">
            {([ariaLabel]) => (
              <Button
                id={`clickable-new${objectName}`}
                aria-label={ariaLabel}
                buttonStyle="primary"
                marginBottom0
                href={createRecordPath ? undefined : this.craftLayerUrl('create')}
                onClick={createRecordPath ? undefined : this.addNewRecord}
                to={createRecordPath || undefined}
              >
                <FormattedMessage id="stripes-smart-components.new" />
              </Button>
            )}
          </FormattedMessage>
        </PaneMenu>
      </IfPermission>
    );
  }

  renderResultsFirstMenu() {
    const { filterPaneIsVisible } = this.state;

    // The toggle is hidden here and rendered within the search pane
    // when the filter pane is visible
    if (filterPaneIsVisible) {
      return null;
    }

    const filters = filterState(queryParam('filters', this.props));
    const filterCount = Object.keys(filters).length;

    return (
      <PaneMenu>
        <ExpandFilterPaneButton
          filterCount={filterCount}
          onClick={this.toggleFilterPane}
        />
      </PaneMenu>
    );
  }

  renderRecordDetails(source) {
    const {
      browseOnly,
      parentResources,
      parentMutator,
      stripes,
      viewRecordPerms,
      detailProps,
      match,
      path,
    } = this.props;

    if (browseOnly) {
      return null;
    }

    if (stripes.hasPerm(viewRecordPerms)) {
      return (
        <Route
          path={path || `${match.path}/view/:id`}
          render={props => (
            <this.connectedViewRecord
              stripes={stripes}
              paneWidth="44%"
              parentResources={parentResources}
              connectedSource={source}
              parentMutator={parentMutator}
              onClose={this.collapseDetails}
              onEdit={this.onEdit}
              editLink={this.craftLayerUrl('edit')}
              onCloseEdit={this.onCloseEdit}
              tagsToggle={this.toggleTags}
              {...props}
              {...detailProps}
            />)}
        />
      );
    }

    return NO_PERMISSION_NODE;
  }

  renderCreateRecordLayer(source) {
    const {
      browseOnly,
      parentResources,
      editRecordComponent,
      detailProps,
      newRecordInitialValues,
      parentMutator,
      location,
      stripes,
      objectName,
      disableRecordCreation,
      newRecordPerms,
    } = this.props;

    if (browseOnly || !editRecordComponent) {
      return null;
    }

    const urlQuery = queryString.parse(location.search || '');
    const isOpen = urlQuery.layer ? urlQuery.layer === 'create' : false;
    const EditRecordComponent = editRecordComponent;

    if (!disableRecordCreation && stripes.hasPerm(newRecordPerms)) {
      return (
        <IntlConsumer>
          {intl => (
            <Layer
              isOpen={isOpen}
              contentLabel={intl.formatMessage({ id: 'stripes-smart-components.sas.createEntry' })}
            >
              <EditRecordComponent
                stripes={stripes}
                id={`${objectName}form-add${objectName}`}
                initialValues={newRecordInitialValues}
                connectedSource={source}
                parentResources={parentResources}
                parentMutator={parentMutator}
                onSubmit={record => this.createRecord(record)}
                onCancel={this.closeNewRecord}
                {...detailProps}
              />
            </Layer>
          )}
        </IntlConsumer>
      );
    }

    return null;
  }

  handleAdvancedSearch = (searchString) => {
    const {
      advancedSearchIndex,
      extraParamsToReset,
    } = this.props;
    const changeIndexEvent = { target: { value: advancedSearchIndex } };
    const changeSearchEvent = { target: { value: searchString } };

    this.onChangeIndex(changeIndexEvent);
    this.onChangeSearch(changeSearchEvent);

    this.setState({ isAdvancedSearchOpen: false });

    this.performSearch({
      query: searchString,
      qindex: advancedSearchIndex,
      ...extraParamsToReset,
    });
  };

  renderSearch(source) {
    const {
      objectName,
      filterConfig,
      renderFilters,
      renderNavigation,
      disableFilters,
      searchableIndexes,
      selectedIndex,
      autofocusSearchField,
      searchFieldButtonLabel,
      advancedSearchOptions,
      inputType,
      indexRef,
      inputRef,
      isCursorAtEnd,
    } = this.props;
    const {
      locallyChangedSearchTerm,
      locallyChangedQueryIndex,
    } = this.state;

    const filters = filterState(queryParam('filters', this.props));
    const query = queryParam('query', this.props) || '';
    const searchTerm = locallyChangedSearchTerm || query;
    const queryIndex = locallyChangedQueryIndex || selectedIndex;

    return (
      <form onSubmit={this.onSubmitSearch}>
        {renderNavigation()}
        <FormattedMessage
          id="stripes-smart-components.searchFieldLabel"
          values={{ moduleName: module ? module.displayName : '' }}
        >
          {([ariaLabel]) => (
            <SearchField
              id={`input-${objectName}-search`}
              autoFocus={autofocusSearchField}
              ariaLabel={ariaLabel}
              className={css.searchField}
              searchableIndexes={searchableIndexes}
              selectedIndex={queryIndex}
              value={searchTerm}
              loading={source.pending()}
              marginBottom0
              onChangeIndex={this.onChangeIndex}
              onChange={this.onChangeSearch}
              onClear={this.onClearSearchQuery}
              inputType={inputType}
              lockWidth
              newLineOnShiftEnter
              onSubmitSearch={this.onSubmitSearch}
              indexRef={indexRef}
              inputRef={inputRef}
              isCursorAtEnd={isCursorAtEnd}
            />
          )}
        </FormattedMessage>
        <Button
          type="submit"
          buttonStyle="primary"
          fullWidth
          disabled={!searchTerm}
          data-test-search-and-sort-submit
        >
          {searchFieldButtonLabel || <FormattedMessage id="stripes-smart-components.search" />}
        </Button>
        {advancedSearchOptions.length
          ? this.renderAdvancedSearch()
          : this.renderResetButton()
        }
        {
          renderFilters
            ? renderFilters(this.onFilterChangeHandler)
            : (
              <FilterGroups
                config={filterConfig}
                filters={filters}
                disableNames={disableFilters}
                onChangeFilter={this.onChangeFilter}
                onClearFilter={this.onClearFilter}
              />
            )
        }
      </form>
    );
  }

  renderResultsList(source, visibleColumns) {
    const {
      nonInteractiveHeaders,
      columnMapping,
      columnWidths,
      resultsFormatter,
      visibleColumns: visibleColumnsProp,
      objectName,
      notLoadedMessage,
      viewRecordPathById,
      pageAmount,
      pagingType,
      getCellClass,
      resultsKey,
      resultRowIsSelected,
      resultsVirtualize,
      resultsOnMarkPosition,
      resultsCachedPosition,
      resultsOnResetMarkedPosition,
      resultRowFormatter,
      hasRowClickHandlers,
      hidePageIndices,
      pagingCanGoPrevious,
      pagingCanGoNext,
      resultsStickyFirstColumn,
      resultsStickyLastColumn,
    } = this.props;
    const {
      filterPaneIsVisible,
      selectedItem,
    } = this.state;

    const objectNameUC = upperFirst(objectName);
    const moduleName = this.getModuleName();
    const records = source.records();
    const count = source.totalCount();
    const query = queryParam('query', this.props) || '';
    const sortOrder = queryParam('sort', this.props) || '';
    const message = <NoResultsMessage
      source={source}
      searchTerm={query}
      filterPaneIsVisible={filterPaneIsVisible}
      toggleFilterPane={this.toggleFilterPane}
      notLoadedMessage={notLoadedMessage}
    />;

    return (
      <FormattedMessage
        id="stripes-smart-components.searchResults"
        values={{ objectName: objectNameUC }}
      >
        {([ariaLabel]) => (
          <MultiColumnList
            key={resultsKey}
            id={`list-${moduleName}`}
            ariaLabel={ariaLabel}
            nonInteractiveHeaders={nonInteractiveHeaders}
            totalCount={count}
            contentData={records}
            selectedRow={selectedItem}
            formatter={resultsFormatter}
            visibleColumns={visibleColumnsProp || visibleColumns}
            sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
            sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
            isEmptyMessage={message}
            columnWidths={columnWidths}
            columnMapping={columnMapping}
            loading={source.pending()}
            autosize
            virtualize={resultsVirtualize}
            hasMargin
            rowFormatter={resultRowFormatter || this.anchoredRowFormatter}
            onRowClick={viewRecordPathById || !hasRowClickHandlers ? undefined : this.onSelectRow}
            onHeaderClick={this.onSort}
            onNeedMoreData={this.onNeedMore}
            pageAmount={pageAmount}
            pagingType={pagingType}
            getCellClass={getCellClass}
            onMarkPosition={resultsOnMarkPosition}
            onMarkReset={resultsOnResetMarkedPosition}
            itemToView={resultsCachedPosition}
            isSelected={resultRowIsSelected}
            hidePageIndices={hidePageIndices}
            pagingCanGoNext={pagingCanGoNext}
            pagingCanGoPrevious={pagingCanGoPrevious}
            stickyFirstColumn={resultsStickyFirstColumn}
            stickyLastColumn={resultsStickyLastColumn}
          />
        )}
      </FormattedMessage>
    );
  }

  getPaneSub(source) {
    const {
      customPaneSub,
      resultCountMessageKey,
      customPaneSubText,
      isCountHidden
    } = this.props;

    const messageKey = resultCountMessageKey || 'stripes-smart-components.searchResultsCountHeader';
    const isSourceLoaded = source.loaded();
    const isTotalCountUndefined = source.totalCount() === undefined;
    const isSearchResultCountUnknown = isSourceLoaded && isTotalCountUndefined;
    const isSearchResultCountPresent = isSourceLoaded && !isTotalCountUndefined;

    return (
      <span className={css.delimiter}>
        <span>
          {isSearchResultCountUnknown && (
            <FormattedMessage id="stripes-smart-components.searchResultsCountUnknown" />
          )}
          {isSearchResultCountPresent && !isCountHidden && (
            <FormattedMessage id={messageKey} values={{ count: source.totalCount() }} />
          )}
          {!isSourceLoaded && (
            customPaneSubText || <FormattedMessage id="stripes-smart-components.searchCriteria" />
          )}
        </span>
        {customPaneSub && (
          <span data-test-custom-pane-sub>{customPaneSub}</span>
        )}
      </span>
    );
  }

  getActionMenu = (columnManagerProps) => (actionMenuProps) => {
    const { actionMenu } = this.props;

    if (typeof actionMenu !== 'function') {
      return null;
    }

    return actionMenu({ ...actionMenuProps, ...columnManagerProps });
  };

  render() {
    const {
      columnManagerProps,
      stripes,
      module,
      title,
      hasNewButton,
      columnMapping,
      namespace,
      viewRecordPathById,
      createRecordPath,
      paneTitleRef,
    } = this.props;
    const { filterPaneIsVisible } = this.state;

    const source = makeConnectedSource(this.props, stripes.logger);
    const moduleName = this.getModuleName();

    const renderResultsPane = ({ visibleColumns, ...columnManagerRenderProps }) => (
      <Pane
        id="pane-results"
        paneTitleRef={paneTitleRef}
        padContent={false}
        defaultWidth="fill"
        actionMenu={this.getActionMenu(columnManagerRenderProps)}
        appIcon={<AppIcon app={moduleName} />}
        paneTitle={title || (module && module.displayName)}
        paneSub={this.getPaneSub(source)}
        lastMenu={hasNewButton ? this.renderNewRecordBtn() : null}
        firstMenu={this.renderResultsFirstMenu()}
        noOverflow
      >
        {this.renderResultsList(source, visibleColumns)}
      </Pane>
    );

    return (
      <PersistedPaneset
        appId={namespace}
        id="search-and-sort-paneset"
        data-test-search-and-sort
      >
        <SRStatus ref={(ref) => { this.SRStatus = ref; }} />
        {/* Filter Pane */}
        {filterPaneIsVisible &&
          <Pane
            data-test-filter-pane
            id="pane-filter"
            defaultWidth="320px"
            paneTitle={<FormattedMessage id="stripes-smart-components.searchAndFilter" />}
            onClose={this.toggleFilterPane}
            lastMenu={
              <PaneMenu>
                <CollapseFilterPaneButton
                  onClick={this.toggleFilterPane}
                />
              </PaneMenu>
            }
          >
            {this.renderSearch(source)}
          </Pane>
        }

        {/* Results Pane */}
        <ColumnManager
          id={`${moduleName}-results-list-column-manager`}
          columnMapping={columnMapping}
          {...columnManagerProps}
        >
          {renderResultsPane}
        </ColumnManager>
        {!viewRecordPathById && this.renderRecordDetails(source)}
        {!createRecordPath && this.renderCreateRecordLayer(source)}
        {this.renderHelperApp()}
      </PersistedPaneset>
    );
  }
}

export default withRouter(
  withModule(
    props => props.packageInfo && props.packageInfo.name
  )(withNamespace(withStripes(SearchAndSort)))
);

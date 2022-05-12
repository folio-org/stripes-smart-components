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
import { NoResultsMessage, ResetButton, CollapseFilterPaneButton, ExpandFilterPaneButton } from './components';
import { ColumnManager } from '../ColumnManager';
import PersistedPaneset from '../PersistedPaneset';

import buildUrl from './buildUrl';

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

class SearchAndSort extends React.Component {
  static propTypes = {
    actionMenu: PropTypes.func, // parameter properties provided by caller
    apolloQuery: PropTypes.object, // machine-readable
    apolloResource: PropTypes.string,
    autofocusSearchField: PropTypes.bool,
    basePath: PropTypes.string,
    browseOnly: PropTypes.bool,
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
    initialFilters: PropTypes.string,
    initialResultCount: PropTypes.number.isRequired,
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
    paginationBoundaries: PropTypes.bool,
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
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    viewRecordComponent: PropTypes.func,
    viewRecordPathById: PropTypes.func,
    viewRecordPerms: PropTypes.string.isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    autofocusSearchField: true,
    columnManagerProps: {},
    customPaneSub: null,
    showSingleResult: false,
    maxSortKeys: 2,
    onComponentWillUnmount: noop,
    onResetAll: noop,
    filterChangeCallback: noop,
    getHelperComponent: noop,
    massageNewRecord: noop,
    renderNavigation: noop,
    hasRowClickHandlers: true,
    selectedIndex: '',
    hasNewButton: true,
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
    } = this.props;

    // Use local storage to remember whether the filter pane has been toggled off or not.
    this.filterPaneVisibilityKey = `${props.namespace}/filterPaneVisibility`;
    const storedFilterPaneState = JSON.parse(window.localStorage.getItem(this.filterPaneVisibilityKey));

    this.state = {
      selectedItem: this.initiallySelectedRecord,
      filterPaneIsVisible: !!storedFilterPaneState !== false ? storedFilterPaneState : true,
      locallyChangedSearchTerm: '',
      locallyChangedQueryIndex: '',
    };

    this.handleFilterChange = handleFilterChange.bind(this);
    this.handleFilterClear = handleFilterClear.bind(this);
    if (viewRecordComponent) this.connectedViewRecord = stripes.connect(viewRecordComponent);

    this.helperApps = {
      tags: stripes.connect(Tags)
    };

    this.SRStatus = null;
    this.lastNonNullReaultCount = undefined;
    this.initialQuery = queryString.parse(this.initialSearch);
    this.initialFilters = this.initialQuery.filters;
    this.initialSort = this.initialQuery.sort;

    const logger = stripes.logger;

    this.log = logger.log.bind(logger);
  }

  componentDidMount() {
    this.updateLocallyChangedSearchTerm();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      stripes: { logger },
      finishedResourceName,
    } = this.props;
    const oldState = makeConnectedSource(this.props, logger);
    const newState = makeConnectedSource(nextProps, logger);
    const {
      location: {
        search,
      },
    } = nextProps;
    const { qindex } = queryString.parse(search);

    // If the nominated mutation has finished, select the newly created record
    const oldStateForFinalSource = makeConnectedSource(this.props, logger, finishedResourceName);
    const newStateForFinalSource = makeConnectedSource(nextProps, logger, finishedResourceName);

    if (oldStateForFinalSource.records()) {
      const finishedResourceNextSM = newStateForFinalSource.successfulMutations();

      if (finishedResourceNextSM.length > oldStateForFinalSource.successfulMutations().length) {
        const sm = newState.successfulMutations();

        if (sm[0]) this.onSelectRow(undefined, { id: sm[0].record.id });
      }
    }

    // If a search that was pending is now complete, notify the screen-reader
    if (oldState.pending() && !newState.pending()) {
      this.log('event', 'new search-result');
      const count = newState.totalCount();

      this.SRStatus.sendMessage(
        <FormattedMessage id="stripes-smart-components.searchReturnedResults" values={{ count }} />
      );
    }

    // if the results list is winnowed down to a single record, display the record.
    // If there's a single hit, open the detail pane
    if (nextProps.showSingleResult &&
      newState.totalCount() === 1 &&
      (this.lastNonNullReaultCount > 1 || (oldState.records()[0] !== newState.records()[0]))) {
      this.onSelectRow(null, newState.records()[0]);
    }

    if (newState.totalCount() !== null) {
      this.lastNonNullReaultCount = newState.totalCount();
    }

    // Reset local qindex if the qindex is not present in the url.
    // This happens when the search segment changes.
    if (this.state.locallyChangedQueryIndex && !qindex) {
      this.setState({ locallyChangedQueryIndex: '' });
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

  updateLocallyChangedSearchTerm() {
    const {
      location: {
        search,
      },
    } = this.props;
    const resQuery = this.queryParam('query');
    const { query } = queryString.parse(search);

    // update locallyChangedSearchTerm only
    // when query from resourceQuery matches url query
    const term = (this.isPluginMode() || resQuery === query) ? query : '';

    this.setState({ locallyChangedSearchTerm: term });
  }

  get initiallySelectedRecord() {
    const { location: { pathname } } = this.props;

    const match = pathname.match(/^\/.*\/view\/(.*)$/);
    const recordId = match && match[1];

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

  onChangeIndex = (e) => {
    this.setState({ locallyChangedQueryIndex: e.target.value });

    if (this.props.onChangeIndex) {
      this.props.onChangeIndex(e);
    }
  }

  onSubmitSearch = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const {
      locallyChangedSearchTerm,
      locallyChangedQueryIndex,
    } = this.state;
    const qindex = locallyChangedQueryIndex || this.props.selectedIndex;

    this.performSearch({
      query: locallyChangedSearchTerm,
      qindex,
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

  resetLocallyChangedQuery = () => {
    this.setState({
      locallyChangedSearchTerm: '',
      locallyChangedQueryIndex: '',
    });
  }

  onClearSearch = () => {
    this.log('action', 'cleared search');

    this.resetLocallyChangedQuery();
    this.transitionToParams({
      query: '',
      qindex: '',
    });

    // This allows the parent to reset other parameters like query index to
    // something that it may prefer instead of an empty qindex.
    this.props.filterChangeCallback({});
  };

  onClearSearchAndFilters = () => {
    this.log('action', 'cleared search and filters');

    this.resetLocallyChangedQuery();
    this.transitionToParams({
      filters: this.initialFilters || '',
      sort: this.initialSort || '',
      query: '',
      qindex: '',
    });

    this.props.filterChangeCallback({});
    this.props.onResetAll();
  };

  onClearSearchQuery = () => {
    this.log('action', 'cleared search query');
    this.setState({ locallyChangedSearchTerm: '' });
    this.transitionToParams({ query: '' });
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
        { this.props.viewRecordPathById
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

  collapseDetails = () => {
    const {
      packageInfo: { stripes },
      onDismissDetail,
    } = this.props;

    if (onDismissDetail) {
      onDismissDetail();
    } else {
      this.setState({ selectedItem: undefined });
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

  queryParam(name) {
    const {
      parentResources: { query },
      nsParams,
    } = this.props;
    const nsKey = getNsKey(name, nsParams);

    return get(query, nsKey);
  }

  toggleFilterPane = () => {
    this.setState(prevState => ({ filterPaneIsVisible: !prevState.filterPaneIsVisible }), () => {
      window.localStorage.setItem(this.filterPaneVisibilityKey, this.state.filterPaneIsVisible);
    });
  };

  toggleHelperApp = (curHelper) => {
    const prevHelper = this.queryParam('helper');
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
    const currentFilters = this.queryParam('filters') || '';
    const noFiltersChoosen = currentFilters === initialFilters;
    const currentQuery = this.queryParam('query');
    const searchTermFieldIsEmpty = isEmpty(this.state.locallyChangedSearchTerm || currentQuery);

    return noFiltersChoosen && searchTermFieldIsEmpty;
  }

  renderResetButton = () => {
    return (
      <div className={css.resetButtonWrap}>
        <ResetButton
          id="clickable-reset-all"
          label={<FormattedMessage id="stripes-smart-components.resetAll" />}
          disabled={this.isResetButtonDisabled()}
          onClick={this.onClearSearchAndFilters}
        />
      </div>
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
    const helper = this.queryParam('helper');
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

    const filters = filterState(this.queryParam('filters'));
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
    } = this.props;
    const {
      locallyChangedSearchTerm,
      locallyChangedQueryIndex,
    } = this.state;

    const filters = filterState(this.queryParam('filters'));
    const query = this.queryParam('query') || '';
    const searchTerm = (locallyChangedSearchTerm !== undefined)
      ? locallyChangedSearchTerm
      : query;
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
        {this.renderResetButton()}
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
      paginationBoundaries
    } = this.props;
    const {
      filterPaneIsVisible,
      selectedItem,
    } = this.state;

    const objectNameUC = upperFirst(objectName);
    const moduleName = this.getModuleName();
    const records = source.records();
    const count = source.totalCount();
    const query = this.queryParam('query') || '';
    const sortOrder = this.queryParam('sort') || '';
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
            containerRef={(ref) => { this.resultsList = ref; }}
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
            paginationBoundaries={paginationBoundaries}
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
          {isSearchResultCountPresent && (
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
      createRecordPath
    } = this.props;
    const { filterPaneIsVisible } = this.state;

    const source = makeConnectedSource(this.props, stripes.logger);
    const moduleName = this.getModuleName();

    const renderResultsPane = ({ visibleColumns, ...columnManagerRenderProps }) => (
      <Pane
        id="pane-results"
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

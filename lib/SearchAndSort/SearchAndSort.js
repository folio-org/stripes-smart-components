// A generalisation of the search-and-sort functionality that underlies searching-and-sorting modules

// NOTE: modules using this with react-apollo MUST set errorPolicy: 'all' for Apollo.

import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import { withRouter } from 'react-router';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { withModule } from '@folio/stripes-core/src/components/Modules';
import { withStripes } from '@folio/stripes-core';
import queryString from 'query-string';
import { debounce, get, includes, upperFirst } from 'lodash';
import FilterGroups, {
  filterState,
  handleFilterChange,
  handleFilterClear
} from '@folio/stripes-components/lib/FilterGroups';
import {
  Button,
  IfPermission,
  Icon,
  IconButton,
  Layer,
  MultiColumnList,
  Pane,
  PaneMenu,
  Paneset,
  SearchField,
  SRStatus
} from '@folio/stripes-components';
import { mapNsKeys, getNsKey } from './nsQueryFunctions';
import Tags from '../Tags';
import css from './SearchAndSort.css';
import makeConnectedSource from './ConnectedSource';
import NoResultsMessage from './components/NoResultsMessage';
import ResetButton from './components/ResetButton';

class SearchAndSort extends React.Component {
  static propTypes = {
    actionMenuItems: PropTypes.arrayOf(PropTypes.object), // parameter properties provided by caller
    apolloQuery: PropTypes.object, // machine-readable
    apolloResource: PropTypes.string,
    browseOnly: PropTypes.bool,
    columnMapping: PropTypes.object,
    columnWidths: PropTypes.object,
    detailProps: PropTypes.object,
    disableFilters: PropTypes.object,
    disableRecordCreation: PropTypes.bool,
    editRecordComponent: PropTypes.func,
    filterChangeCallback: PropTypes.func,
    filterConfig: PropTypes.arrayOf(
      PropTypes.shape({
        cql: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
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
    ).isRequired,
    finishedResourceName: PropTypes.string,
    getHelperResourcePath: PropTypes.func,
    initialFilters: PropTypes.string,
    initialResultCount: PropTypes.number.isRequired,
    intl: intlShape,
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
      displayName: PropTypes.string, // human-readable
    }),
    newRecordInitialValues: PropTypes.object,
    newRecordPerms: PropTypes.string,
    notLoadedMessage: PropTypes.string,
    nsParams: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    objectName: PropTypes.string.isRequired,
    onChangeIndex: PropTypes.func,
    onComponentWillUnmount: PropTypes.func,
    onCreate: PropTypes.func,
    onSelectRow: PropTypes.func,
    packageInfo: PropTypes.shape({ // values pulled from the provider's package.json config object
      initialFilters: PropTypes.string, // default filters
      moduleName: PropTypes.string, // machine-readable, for HTML ids and translation keys
      stripes: PropTypes.shape({
        route: PropTypes.string, // base route; used to construct URLs
      }).isRequired,
    }),
    parentData: PropTypes.object,
    parentMutator: PropTypes.shape({
      query: PropTypes.shape({
        replace: PropTypes.func.isRequired,
        update: PropTypes.func.isRequired,
      }),
      resultCount: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired, // only needed when GraphQL is used
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
    resultCountIncrement: PropTypes.number.isRequired, // collection to be exploded and passed on to the detail view
    resultCountMessageKey: PropTypes.string, // URL path to parse for detail views
    resultsFormatter: PropTypes.shape({}),
    searchableIndexes: PropTypes.arrayOf(
      PropTypes.object,
    ),
    searchableIndexesPlaceholder: PropTypes.string,
    selectedIndex: PropTypes.string, // whether to auto-show the details record when a search returns a single row
    showSingleResult: PropTypes.bool,
    stripes: PropTypes.shape({
      connect: PropTypes.func,
      hasPerm: PropTypes.func.isRequired
    }),
    viewRecordComponent: PropTypes.func.isRequired,
    viewRecordPerms: PropTypes.string.isRequired,
    visibleColumns: PropTypes.arrayOf(
      PropTypes.string,
    ),
  };

  static defaultProps = {
    showSingleResult: false,
  };

  constructor(props) {
    super(props);

    let initiallySelected = {};
    const match = this.props.location.pathname.match('/[^/]*/view/');
    if (match && match.index === 0) {
      const id = /view\/(.*)$/.exec(this.props.location.pathname)[1];
      initiallySelected = { id };
    }

    this.state = {
      selectedItem: initiallySelected,
      filterPaneIsVisible: true,
    };

    this.handleFilterChange = handleFilterChange.bind(this);
    this.handleFilterClear = handleFilterClear.bind(this);
    this.connectedViewRecord = props.stripes.connect(props.viewRecordComponent);

    this.helperApps = {
      tags: props.stripes.connect(Tags)
    };

    this.SRStatus = null;
    this.lastNonNullReaultCount = undefined;

    const initialPath = (get(props.packageInfo, ['stripes', 'home']) || get(props.packageInfo, ['stripes', 'route']));
    const initialSearch = initialPath.indexOf('?') === -1 ? initialPath :
      initialPath.substr(initialPath.indexOf('?') + 1);
    const initialQuery = queryString.parse(initialSearch);
    this.initialFilters = initialQuery.filters;

    const logger = props.stripes.logger;
    this.log = logger.log.bind(logger);
    this.transitionToParams = this.transitionToParams.bind(this);
  }

  componentWillReceiveProps(nextProps) {  // eslint-disable-line react/no-deprecated
    const { intl: { formatMessage }, stripes: { logger } } = this.props;
    const oldState = makeConnectedSource(this.props, logger);
    const newState = makeConnectedSource(nextProps, logger);

    {
      // If the nominated mutation has finished, select the newly created record
      const oldStateForFinalSource = makeConnectedSource(this.props, logger, this.props.finishedResourceName);
      const newStateForFinalSource = makeConnectedSource(nextProps, logger, this.props.finishedResourceName);

      if (oldStateForFinalSource.records()) {
        const finishedResourceNextSM = newStateForFinalSource.successfulMutations();
        if (finishedResourceNextSM.length > oldStateForFinalSource.successfulMutations().length) {
          const sm = newState.successfulMutations();
          if (sm[0]) this.onSelectRow(undefined, { id: sm[0].record.id });
        }
      }
    }

    // If a search that was pending is now complete, notify the screen-reader
    if (oldState.pending() && !newState.pending()) {
      this.log('event', 'new search-result');
      const count = newState.totalCount();
      this.SRStatus.sendMessage(
        formatMessage({ id: 'stripes-smart-components.searchReturnedResults' }, { count })
      );
    }

    // if the results list is winnowed down to a single record, display the record.
    if (nextProps.showSingleResult &&
        newState.totalCount() === 1 &&
        this.lastNonNullReaultCount > 1) {
      this.onSelectRow(null, newState.records()[0]);
    }

    if (newState.totalCount() !== null) {
      this.lastNonNullReaultCount = newState.totalCount();
    }
  }

  componentWillUnmount() {
    if (this.props.onComponentWillUnmount) {
      this.props.onComponentWillUnmount(this.props);
    }
  }

  craftLayerUrl = (mode) => {
    const url = this.props.location.pathname + this.props.location.search;
    return includes(url, '?') ? `${url}&layer=${mode}` : `${url}?layer=${mode}`;
  }

  onChangeFilter = (e) => {
    this.props.parentMutator.resultCount.replace(this.props.initialResultCount);
    const newFilters = this.handleFilterChange(e);
    if (this.props.filterChangeCallback) this.props.filterChangeCallback(newFilters);
  }

  onChangeSearch = (e) => {
    const query = e.target.value;
    this.setState({ locallyChangedSearchTerm: query });
  }

  onSubmitSearch = (e) => {
    e.preventDefault();
    this.performSearch(this.state.locallyChangedSearchTerm);
  }

  onClearFilter = (e) => {
    const newFilters = this.handleFilterClear(e);
    if (this.props.filterChangeCallback) this.props.filterChangeCallback(newFilters);
  }

  onClearSearch = () => {
    this.log('action', 'cleared search');
    this.setState({ locallyChangedSearchTerm: '' });
    this.transitionToParams({ query: '', qindex: '' });

    // This allows the parent to reset other parameters like query index to
    // something that it may prefer instead of an empty qindex.
    if (this.props.filterChangeCallback) this.props.filterChangeCallback({});
  }

  onClearSearchAndFilters = () => {
    this.log('action', 'cleared search and filters');

    this.setState({ locallyChangedSearchTerm: '' });
    this.transitionToParams({ filters: this.initialFilters || '', query: '', qindex: '' });

    if (this.props.filterChangeCallback) this.props.filterChangeCallback({});
  }

  onClearSearchQuery = () => {
    this.log('action', 'cleared search query');
    this.setState({ locallyChangedSearchTerm: '' });
    this.transitionToParams({ query: '' });
  }

  onCloseEdit = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close edit"');
    this.transitionToParams({ layer: null });
  }

  onEdit = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "edit"');
    this.transitionToParams({ layer: 'edit' });
  }

  transitionToParams(values) {
    const { nsParams, parentMutator } = this.props;
    const nsValues = mapNsKeys(values, nsParams);
    parentMutator.query.update(nsValues);
  }

  onNeedMore = () => {
    const source = makeConnectedSource(this.props, this.props.stripes.logger);
    source.fetchMore(this.props.resultCountIncrement);
  }

  onSelectRow = (e, meta) => {
    if (this.props.onSelectRow) {
      const shouldFallBackToRegularRecordDisplay = this.props.onSelectRow(e, meta);
      if (!shouldFallBackToRegularRecordDisplay) return;
    }
    this.log('action', `clicked ${meta.id}, selected record =`, meta);
    this.setState({ selectedItem: meta });
    this.transitionToParams({ _path: `${this.props.packageInfo.stripes.route}/view/${meta.id}` });
  }

  onSort = (e, meta) => {
    const newOrder = meta.alias;
    const oldOrder = this.queryParam('sort');

    const orders = oldOrder ? oldOrder.split(',') : [];
    if (orders[0] && newOrder === orders[0].replace(/^-/, '')) {
      orders[0] = `-${orders[0]}`.replace(/^--/, '');
    } else {
      orders.unshift(newOrder);
    }

    const maxSortKeys = this.props.maxSortKeys || 2;
    const sortOrder = orders.slice(0, maxSortKeys).join(',');
    this.log('action', `sorted by ${sortOrder}`);
    this.transitionToParams({ sort: sortOrder });
  }

  getRowURL(id) {
    return `${this.props.match.path}/view/${id}${this.props.location.search}`;
  }

  addNewRecord = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "add new record"');
    this.transitionToParams({ layer: 'create' });
  }

  // custom row formatter to wrap rows in anchor tags.
  anchoredRowFormatter = (
    { rowIndex,
      rowClass,
      rowData,
      cells,
      rowProps,
      labelStrings },
  ) => (
    <div role="listitem" key={`row-${rowIndex}`}>
      <a
        href={this.getRowURL(rowData.id)}
        aria-label={labelStrings && labelStrings.join('...')}
        className={rowClass}
        {...rowProps}
      >
        {cells}
      </a>
    </div>
  );

  closeNewRecord = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close new record"');
    this.transitionToParams({ layer: null });
  }

  collapseDetails = () => {
    this.setState({ selectedItem: {} });
    this.transitionToParams({ _path: `${this.props.packageInfo.stripes.route}/view` });
  }

  createRecord(record) {
    if (this.props.massageNewRecord) this.props.massageNewRecord(record);
    this.props.onCreate(record);
  }

  // eslint-disable-next-line react/sort-comp
  performSearch = debounce((query) => {
    this.props.parentMutator.resultCount.replace(this.props.initialResultCount);
    this.log('action', `searched for '${query}'`);
    this.transitionToParams({ query });
  }, 350);

  queryParam(name) {
    const { parentResources, nsParams } = this.props;
    const nsKey = getNsKey(name, nsParams);
    return get(parentResources.query, nsKey);
  }

  toggleFilterPane = () => {
    this.setState(prevState => ({ filterPaneIsVisible: !prevState.filterPaneIsVisible }));
  }

  toggleHelperApp = (curHelper) => {
    const prevHelper = this.queryParam('helper');
    const helper = (prevHelper === curHelper) ? null : curHelper;
    this.transitionToParams({ helper });
  }

  toggleTags = () => this.toggleHelperApp('tags')

  getModuleName() {
    const { packageInfo } = this.props;
    return packageInfo.name.replace(/.*\//, '');
  }

  renderResetButton = () => {
    const initialFilters = this.initialFilters || '';
    const currentFilters = this.queryParam('filters') || '';
    const filtersHaveChanged = currentFilters !== initialFilters;
    const searchTerm = this.state.locallyChangedSearchTerm || '';
    const searchIndex = this.queryParam('qindex') || '';
    const searchHasChanged = searchTerm !== '' || searchIndex !== '';

    return (
      <div className={css.resetButtonWrap}>
        <ResetButton
          className={css.resetButton}
          visible={filtersHaveChanged || searchHasChanged}
          onClick={this.onClearSearchAndFilters}
          id="clickable-reset-all"
          label={<FormattedMessage id="stripes-smart-components.resetAll" />}
        />
      </div>
    );
  }

  renderHelperApp() {
    const { stripes, match, getHelperResourcePath } = this.props;
    const moduleName = this.getModuleName();
    const helper = this.queryParam('helper');
    const HelperAppComponent = this.helperApps[helper];

    return (
      helper &&
      <Route
        path={`${match.path}/view/:id`}
        render={props => {
          const link = (getHelperResourcePath) ?
            getHelperResourcePath(helper, props.match.params.id) :
            `${moduleName}/${props.match.params.id}`;
          return (
            <HelperAppComponent
              stripes={stripes}
              onToggle={() => this.toggleHelperApp(helper)}
              link={link}
              {...props}
            />
          );
        }}
      />
    );
  }

  render() {
    const {
      intl: { formatMessage },
      parentResources,
      filterConfig,
      disableFilters,
      newRecordPerms,
      viewRecordPerms,
      objectName,
      detailProps,
      stripes
    } = this.props;
    const { locallyChangedSearchTerm } = this.state;
    const source = makeConnectedSource(this.props, stripes.logger);
    const urlQuery = queryString.parse(this.props.location.search || '');
    const objectNameUC = upperFirst(objectName);
    const records = source.records();
    const searchTerm =
      (locallyChangedSearchTerm !== undefined) ? locallyChangedSearchTerm : (this.queryParam('query') || '');
    const filters = filterState(this.queryParam('filters'));

    const moduleName = this.getModuleName();

    const appIcon = {
      app: moduleName,
    };

    const newRecordButton = !newRecordPerms ? null : (
      <IfPermission perm={newRecordPerms}>
        <PaneMenu>
          <Button
            id={`clickable-new${objectName}`}
            href={this.craftLayerUrl('create')}
            onClick={this.addNewRecord}
            aria-label={formatMessage({ id: 'stripes-smart-components.addNew' })}
            buttonStyle="primary paneHeaderNewButton"
            marginBottom0
          >
            <Icon icon="plus-sign">
              {formatMessage({ id: 'stripes-smart-components.new' })}
            </Icon>
          </Button>
        </PaneMenu>
      </IfPermission>
    );

    const { filterPaneIsVisible } = this.state;
    const filterCount = Object.keys(filters).length;
    const hidePaneMsg = formatMessage({ id: 'stripes-smart-components.hideSearchPane' });
    const showPaneMsg = formatMessage({ id: 'stripes-smart-components.showSearchPane' });
    const appliedFiltersMsg = formatMessage({ id: 'stripes-smart-components.numberOfFilters' }, { count: filterCount });
    const toggleFilterPaneMessage = `${filterPaneIsVisible ? hidePaneMsg : showPaneMsg} \n\n${appliedFiltersMsg}`;

    const resultsFirstMenu = (
      <PaneMenu>
        <IconButton
          icon="search"
          aria-label={toggleFilterPaneMessage}
          onClick={this.toggleFilterPane}
          badgeCount={!filterPaneIsVisible && filterCount ? filterCount : undefined}
        />
      </PaneMenu>
    );

    const detailsPane = (
      stripes.hasPerm(viewRecordPerms) ?
        (
          <Route
            path={this.props.path ? this.props.path : `${this.props.match.path}/view/:id`}
            render={props => <this.connectedViewRecord
              stripes={stripes}
              paneWidth="44%"
              parentResources={parentResources}
              connectedSource={source}
              parentMutator={this.props.parentMutator}
              onClose={this.collapseDetails}
              onEdit={this.onEdit}
              editLink={this.craftLayerUrl('edit')}
              onCloseEdit={this.onCloseEdit}
              tagsToggle={this.toggleTags}
              {...props}
              {...detailProps}
            />}
          />
        ) : (
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
          </div>));

    const count = source.totalCount();
    const message = <NoResultsMessage
      source={source}
      searchTerm={searchTerm}
      filterPaneIsVisible={filterPaneIsVisible}
      toggleFilterPane={this.toggleFilterPane}
      notLoadedMessage={this.props.notLoadedMessage}
    />;
    const sortOrder = this.queryParam('sort') || '';

    const createRecordLayer = (!this.props.editRecordComponent ? '' :
    <Layer isOpen={urlQuery.layer ? urlQuery.layer === 'create' : false}>
      <this.props.editRecordComponent
        stripes={stripes}
        id={`${objectName}form-add${objectName}`}
        initialValues={this.props.newRecordInitialValues}
        onSubmit={record => this.createRecord(record)}
        onCancel={this.closeNewRecord}
        parentResources={parentResources}
        connectedSource={source}
        parentMutator={this.props.parentMutator}
        {...detailProps}
      />
    </Layer>);

    const messageKey =
      this.props.resultCountMessageKey ?
        this.props.resultCountMessageKey : 'stripes-smart-components.searchResultsCountHeader';
    const paneSub =
      !source.loaded() ?
        formatMessage({ id: 'stripes-smart-components.searchCriteria' }) : formatMessage({ id: messageKey }, { count });

    return (
      <Paneset>
        <SRStatus ref={(ref) => { this.SRStatus = ref; }} />
        {/* Filter Pane */}
        { filterPaneIsVisible ?
          <Pane
            id="pane-filter"
            defaultWidth="320px"
            paneTitle={formatMessage({ id: 'stripes-smart-components.searchAndFilter' })}
            onClose={this.toggleFilterPane}
          >
            <form onSubmit={this.onSubmitSearch}>
              <SearchField
                id={`input-${objectName}-search`}
                searchableIndexes={this.props.searchableIndexes}
                selectedIndex={this.props.selectedIndex}
                onChangeIndex={this.props.onChangeIndex}
                onChange={this.onChangeSearch}
                onClear={this.onClearSearchQuery}
                value={searchTerm}
                loading={source.pending()}
              />
              <Button
                type="submit"
                buttonStyle="primary"
                fullWidth
                disabled={!searchTerm}
                data-test-search-and-sort-submit
              >
                <FormattedMessage id="stripes-smart-components.search" />
              </Button>
              <hr />
              { this.renderResetButton() }
              <FilterGroups
                config={filterConfig}
                filters={filters}
                onChangeFilter={this.onChangeFilter}
                onClearFilter={this.onClearFilter}
                disableNames={disableFilters}
              />
            </form>
          </Pane>
          :
          null
        }
        {/* Results Pane */}
        <Pane
          padContent={false}
          id="pane-results"
          defaultWidth="fill"
          actionMenuItems={this.props.actionMenuItems}
          appIcon={appIcon}
          paneTitle={this.props.module.displayName}
          paneSub={paneSub}
          lastMenu={!this.props.disableRecordCreation ? newRecordButton : null}
          firstMenu={resultsFirstMenu}
          noOverflow
        >
          <MultiColumnList
            id={`list-${moduleName}`}
            totalCount={count}
            contentData={records}
            selectedRow={this.state.selectedItem}
            formatter={this.props.resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            onNeedMoreData={this.onNeedMore}
            visibleColumns={this.props.visibleColumns}
            sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
            sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
            isEmptyMessage={message}
            columnWidths={this.props.columnWidths}
            columnMapping={this.props.columnMapping}
            loading={source.pending()}
            autosize
            virtualize
            ariaLabel={formatMessage({ id: 'stripes-smart-components.searchResults' }, { objectName: objectNameUC })}
            rowFormatter={this.anchoredRowFormatter}
            containerRef={(ref) => { this.resultsList = ref; }}
          />
        </Pane>
        { !this.props.browseOnly && detailsPane }
        { !this.props.browseOnly && createRecordLayer }
        { this.renderHelperApp() }

      </Paneset>
    );
  }
}

export default withRouter(
  withModule(
    props => props.packageInfo && props.packageInfo.name
  )(withStripes(injectIntl(SearchAndSort)))
);

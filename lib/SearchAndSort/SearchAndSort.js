// A generalisation of the search-and-sort functionality that underlies searching-and-sorting modules

// NOTE: modules using this with react-apollo MUST set errorPolicy: 'all' for Apollo.

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import { withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { stripesShape } from '@folio/stripes-core/src/Stripes';
import { withModule } from '@folio/stripes-core/src/components/Modules';
import queryString from 'query-string';
import FilterGroups, { filterState, handleFilterChange, handleFilterClear } from '@folio/stripes-components/lib/FilterGroups';
import { Accordion, FilterAccordionHeader } from '@folio/stripes-components/lib/Accordion';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import IconButton from '@folio/stripes-components/lib/IconButton';
import Icon from '@folio/stripes-components/lib/Icon';
import Layer from '@folio/stripes-components/lib/Layer';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import SRStatus from '@folio/stripes-components/lib/SRStatus';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import SearchField from '@folio/stripes-components/lib/SearchField';
import craftLayerUrl from '@folio/stripes-components/util/craftLayerUrl';
import { mapNsKeys, getNsKey } from '@folio/stripes-components/util/nsQueryFunctions';
import Notes from '../Notes';
import css from './SearchAndSort.css';
import makeConnectedSource from './ConnectedSource';
import NoResultsMessage from './components/NoResultsMessage';

class SearchAndSort extends React.Component { // eslint-disable-line react/no-deprecated
  static manifest = Object.freeze({
    notes: {
      type: 'okapi',
      path: 'notes',
      records: 'notes',
      clear: false,
      GET: {
        params: {
          query: 'link=:{id}',
        },
      },
    },
  });

  static propTypes = {
    // parameter properties provided by caller
    objectName: PropTypes.string.isRequired, // machine-readable
    searchableIndexes: PropTypes.arrayOf(
      PropTypes.object,
    ),
    searchableIndexesPlaceholder: PropTypes.string,
    selectedIndex: PropTypes.string,
    onChangeIndex: PropTypes.func,
    maxSortKeys: PropTypes.number,
    filterConfig: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        cql: PropTypes.string.isRequired,
        values: PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
              name: PropTypes.string.isRequired,
              cql: PropTypes.string.isRequired,
            }),
          ]),
        ).isRequired,
      }),
    ).isRequired,
    initialFilters: PropTypes.string,
    disableFilters: PropTypes.object,
    filterChangeCallback: PropTypes.func,
    initialResultCount: PropTypes.number.isRequired,
    resultCountIncrement: PropTypes.number.isRequired,
    viewRecordComponent: PropTypes.func.isRequired,
    editRecordComponent: PropTypes.func,
    newRecordInitialValues: PropTypes.object,
    visibleColumns: PropTypes.arrayOf(
      PropTypes.string,
    ),
    columnWidths: PropTypes.object,
    columnMapping: PropTypes.object,
    resultsFormatter: PropTypes.shape({}),
    onSelectRow: PropTypes.func,
    massageNewRecord: PropTypes.func,
    onCreate: PropTypes.func,
    finishedResourceName: PropTypes.string,
    viewRecordPerms: PropTypes.string.isRequired,
    newRecordPerms: PropTypes.string,
    disableRecordCreation: PropTypes.bool,
    parentResources: PropTypes.shape({
      query: PropTypes.shape({
        filters: PropTypes.string,
        notes: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.bool,
        ]),
      }),
      resultCount: PropTypes.number,
      records: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number.isRequired,
        }),
        isPending: PropTypes.bool.isPending,
        successfulMutations: PropTypes.arrayOf(
          PropTypes.shape({
            record: PropTypes.shape({
              id: PropTypes.string.isRequired,
            }).isRequired,
          }),
        ),
      }),
    }).isRequired,
    parentMutator: PropTypes.shape({
      resultCount: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
      query: PropTypes.shape({
        update: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired,
      }),
    }).isRequired,
    parentData: PropTypes.object,
    queryFunction: PropTypes.func, // only needed when GraphQL is used
    apolloQuery: PropTypes.object,
    apolloResource: PropTypes.string,

    // collection to be exploded and passed on to the detail view
    detailProps: PropTypes.object,

    // URL path to parse for detail views
    path: PropTypes.string,

    // react-route properties provided by withRouter
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    onComponentWillUnmount: PropTypes.func,

    // whether to auto-show the details record when a search returns a single row
    showSingleResult: PropTypes.bool,

    // values pulled from the provider's package.json config object
    packageInfo: PropTypes.shape({
      initialFilters: PropTypes.string, // default filters
      moduleName: PropTypes.string, // machine-readable, for HTML ids and translation keys
      stripes: PropTypes.shape({
        route: PropTypes.string, // base route; used to construct URLs
      }).isRequired,
    }),

    // values specified by the ModulesContext
    module: PropTypes.shape({
      displayName: PropTypes.string, // human-readable
    }),

    browseOnly: PropTypes.bool,
    nsParams: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
  };

  static contextTypes = {
    stripes: stripesShape.isRequired,
  };

  static defaultProps = {
    showSingleResult: false,
  };

  constructor(props, context) {
    super(props, context);

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
    this.connectedViewRecord = context.stripes.connect(props.viewRecordComponent);
    this.connectedNotes = context.stripes.connect(Notes);
    this.SRStatus = null;
    this.lastNonNullReaultCount = undefined;

    this.craftLayerUrl = craftLayerUrl.bind(this);

    const initialPath = (_.get(props.packageInfo, ['stripes', 'home']) || _.get(props.packageInfo, ['stripes', 'route']));
    const initialSearch = initialPath.indexOf('?') === -1 ? initialPath :
      initialPath.substr(initialPath.indexOf('?') + 1);
    const initialQuery = queryString.parse(initialSearch);
    this.initialFilters = initialQuery.filters;

    const logger = context.stripes.logger;
    this.log = logger.log.bind(logger);
    this.transitionToParams = this.transitionToParams.bind(this);
  }

  componentDidMount() {
    const query = this.queryParam('query');
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ locallyChangedSearchTerm: query });
  }

  componentWillReceiveProps(nextProps) {
    const logger = this.context.stripes.logger;
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
      this.SRStatus.sendMessage(this.context.stripes.intl.formatMessage({ id: 'stripes-smart-components.searchReturnedResults' }, { count }));
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

  onChangeFilter = (e) => {
    this.props.parentMutator.resultCount.replace(this.props.initialResultCount);
    const newFilters = this.handleFilterChange(e);
    if (this.props.filterChangeCallback) this.props.filterChangeCallback(newFilters);
  }

  onChangeSearch = (e) => {
    const query = e.target.value;

    this.setState({ locallyChangedSearchTerm: query });
    this.performSearch(query);
  }

  onClearFilter = (e) => {
    const newFilters = this.handleFilterClear(e);
    if (this.props.filterChangeCallback) this.props.filterChangeCallback(newFilters);
  }

  onClearSearch = () => {
    this.log('action', 'cleared search');
    this.setState({ locallyChangedSearchTerm: undefined });
    this.transitionToParams({ query: '', qindex: '' });

    // This allows the parent to reset other parameters like query index to
    // something that it may prefer instead of an empty qindex.
    if (this.props.filterChangeCallback) this.props.filterChangeCallback({});
  }

  onClearSearchAndFilters = () => {
    this.log('action', 'cleared search and filters');

    this.setState({ locallyChangedSearchTerm: undefined });
    this.transitionToParams({ filters: this.initialFilters || '', query: '', qindex: '' });

    if (this.props.filterChangeCallback) this.props.filterChangeCallback({});
  }

  onClearSearchQuery = () => {
    this.log('action', 'cleared search query');
    this.setState({ locallyChangedSearchTerm: undefined });
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
    const source = makeConnectedSource(this.props, this.context.stripes.logger);
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
    const first = this.props.location.pathname.split('/')[1];
    return `/${first}/view/${id}${this.props.location.search}`;
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
  performSearch = _.debounce((query) => {
    this.props.parentMutator.resultCount.replace(this.props.initialResultCount);
    this.log('action', `searched for '${query}'`);
    this.transitionToParams({ query });
  }, 350);

  queryParam(name) {
    const { parentResources, nsParams } = this.props;
    const nsKey = getNsKey(name, nsParams);
    return _.get(parentResources.query, nsKey);
  }

  toggleFilterPane = () => {
    this.setState(prevState => ({ filterPaneIsVisible: !prevState.filterPaneIsVisible }));
  }

  toggleNotes = () => {
    const show = this.queryParam('notes');
    this.transitionToParams({
      notes: show ? null : true,
    });
  }

  renderResetButton = () => {
    const initialFilters = this.initialFilters || '';
    const currentFilters = this.queryParam('filters') || '';
    const filtersHaveChanged = currentFilters !== initialFilters;
    const searchTerm = this.state.locallyChangedSearchTerm || '';
    const searchIndex = this.queryParam('qindex') || '';
    const searchHasChanged = searchTerm !== '' || searchIndex !== '';

    if (!filtersHaveChanged && !searchHasChanged) return null;

    return (
      <Button buttonStyle="none" paddingSide0 onClick={this.onClearSearchAndFilters} id="clickable-reset-all">
        <Icon size="small" icon="clearX" />
        <FormattedMessage id="stripes-smart-components.resetAll" />
      </Button>
    );
  }

  render() {
    const { parentResources, filterConfig, disableFilters, newRecordPerms, viewRecordPerms, objectName, detailProps, packageInfo } = this.props;
    const source = makeConnectedSource(this.props, this.context.stripes.logger);
    const urlQuery = queryString.parse(this.props.location.search || '');
    const stripes = this.context.stripes;
    const objectNameUC = _.upperFirst(objectName);
    const records = source.records();
    const searchTerm = this.state.locallyChangedSearchTerm || '';
    const searchIndex = this.queryParam('qindex') || '';
    const filters = filterState(this.queryParam('filters'));
    const formatMsg = stripes.intl.formatMessage;

    const moduleName = packageInfo.name.replace(/.*\//, '');
    const appIcon = {
      app: moduleName,
    };

    const newRecordButton = !newRecordPerms ? '' : (
      <IfPermission perm={newRecordPerms}>
        <PaneMenu>
          <Button
            id={`clickable-new${objectName}`}
            href={this.craftLayerUrl('create')}
            onClick={this.addNewRecord}
            aria-label={formatMsg({ id: 'stripes-smart-components.addNew' })}
            buttonStyle="primary paneHeaderNewButton"
            marginBottom0
          >{formatMsg({ id: 'stripes-smart-components.new' })}
          </Button>
        </PaneMenu>
      </IfPermission>
    );

    const { filterPaneIsVisible } = this.state;
    const filterCount = Object.keys(filters).length;
    const hidePaneMsg = formatMsg({ id: 'stripes-smart-components.hideSearchPane' });
    const showPaneMsg = formatMsg({ id: 'stripes-smart-components.showSearchPane' });
    const appliedFiltersMsg = formatMsg({ id: 'stripes-smart-components.numberOfFilters' }, { count: filterCount });
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
              notesToggle={this.toggleNotes}
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
    const message = (<NoResultsMessage source={source} searchTerm={searchTerm} filterPaneIsVisible={filterPaneIsVisible} toggleFilterPane={this.toggleFilterPane} />);
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

    const paneSub = !source.loaded() ? formatMsg({ id: 'stripes-smart-components.searchCriteria' }) : formatMsg({ id: `ui-${moduleName}.resultCount` }, { count });
    return (
      <Paneset>
        <SRStatus ref={(ref) => { this.SRStatus = ref; }} />
        {/* Filter Pane */}
        { filterPaneIsVisible ?
          <Pane
            id="pane-filter"
            dismissible
            defaultWidth="16%"
            paneTitle={formatMsg({ id: 'stripes-smart-components.searchAndFilter' })}
            onClose={this.toggleFilterPane}
          >
            { this.renderResetButton() }
            <Accordion
              label={formatMsg({ id: 'stripes-smart-components.search' })}
              name="Search"
              separator={false}
              header={FilterAccordionHeader}
              displayClearButton={searchTerm !== '' || searchIndex !== ''}
              onClearFilter={this.onClearSearch}
            >
              <SearchField
                id={`input-${objectName}-search`}
                className={css.searchField}
                searchableIndexes={this.props.searchableIndexes}
                selectedIndex={this.props.selectedIndex}
                onChangeIndex={this.props.onChangeIndex}
                onChange={this.onChangeSearch}
                onClear={this.onClearSearchQuery}
                value={searchTerm}
                loading={source.pending()}
              />
            </Accordion>
            <FilterGroups
              config={filterConfig}
              filters={filters}
              onChangeFilter={this.onChangeFilter}
              onClearFilter={this.onClearFilter}
              disableNames={disableFilters}
            />
          </Pane>
          :
          null
        }
        {/* Results Pane */}
        <Pane
          padContent={false}
          id="pane-results"
          defaultWidth="fill"
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
            ariaLabel={formatMsg({ id: 'stripes-smart-components.searchResults' }, { objectName: objectNameUC })}
            rowFormatter={this.anchoredRowFormatter}
            containerRef={(ref) => { this.resultsList = ref; }}
          />
        </Pane>
        {
          detailsPane
        }
        {
          !this.props.browseOnly && createRecordLayer
        }
        {
          this.queryParam('notes') &&
          <Route
            path={`${this.props.match.path}/view/:id`}
            render={props => <this.connectedNotes
              stripes={stripes}
              onToggle={this.toggleNotes}
              link={`${moduleName}/${props.match.params.id}`}
              {...props}
            />}
          />
          }
      </Paneset>
    );
  }
}

export default withRouter(
  withModule(
    props => props.packageInfo && props.packageInfo.name
  )(SearchAndSort)
);

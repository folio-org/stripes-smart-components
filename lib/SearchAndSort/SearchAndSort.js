// A generalisation of the search-and-sort functionality that underlies searching-and-sorting modules

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import { withRouter } from 'react-router';
// eslint-disable-next-line import/no-unresolved
import { stripesShape } from '@folio/stripes-core/src/Stripes';
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
import SearchField from '@folio/stripes-components/lib/structures/SearchField';
import craftLayerUrl from '@folio/stripes-components/util/craftLayerUrl';
import Notes from '../Notes';
import css from './SearchAndSort.css';
import ResourcesAnalyzer from './ResourcesAnalyzer';


function noRecordsMessage(r, searchTerm) {
  if (!r || r.isPending) return 'Loading...';
  if (r.failed) return <div><h2>Error {r.failed.httpStatus}</h2><p>{r.failed.message}</p></div>;
  if (!r.hasLoaded) return '';
  if (!searchTerm) return 'No results found. Please check your filters.';
  return `No results found for "${searchTerm}". Please check your spelling and filters.`;
}


class SearchAndSort extends React.Component {
  static contextTypes = {
    stripes: stripesShape.isRequired,
  };

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
      moduleName: PropTypes.string,     // machine-readable, for HTML ids and translation keys
      moduleTitle: PropTypes.string,    // human-readable
      stripes: PropTypes.shape({
        route: PropTypes.string,        // base route; used to construct URLs
      }).isRequired,
    }),

    browseOnly: PropTypes.bool,
  };

  static defaultProps = {
    showSingleResult: false,
  };

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

    this.transitionToParams = values => this.props.parentMutator.query.update(values);
    this.handleFilterChange = handleFilterChange.bind(this);
    this.handleFilterClear = handleFilterClear.bind(this);
    this.connectedViewRecord = context.stripes.connect(props.viewRecordComponent);
    this.connectedNotes = context.stripes.connect(Notes);
    this.SRStatus = null;

    this.craftLayerUrl = craftLayerUrl.bind(this);

    const initialPath = (_.get(props.packageInfo, ['stripes', 'home']) || _.get(props.packageInfo, ['stripes', 'route']));
    const initialSearch = initialPath.indexOf('?') === -1 ? initialPath :
      initialPath.substr(initialPath.indexOf('?') + 1);
    const initialQuery = queryString.parse(initialSearch);
    this.initialFilters = initialQuery.filters;

    const logger = context.stripes.logger;
    this.log = logger.log.bind(logger);
  }

  componentWillReceiveProps(nextProps) {
    const finishedResourceName = this.props.finishedResourceName || 'records';
    const recordResource = this.props.parentResources.records;
    const finishedResource = this.props.parentResources[finishedResourceName];

    // If the nominated mutation has finished, select the newly created record
    if (finishedResource) {
      const finishedResourceNextSM = nextProps.parentResources[finishedResourceName].successfulMutations;
      const sm = nextProps.parentResources.records.successfulMutations;
      if (finishedResourceNextSM.length > finishedResource.successfulMutations.length) {
        this.onSelectRow(undefined, { id: sm[0].record.id });
      }
    }

    // If a search that was pending is now complete, notify the screen-reader
    if (recordResource && recordResource.isPending && !nextProps.parentResources.records.isPending) {
      this.log('event', 'new search-result');
      const resultAmount = _.get(nextProps.parentResources.records, ['other', 'totalRecords']);
      this.SRStatus.sendMessage(`Search returned ${resultAmount} result${resultAmount !== 1 ? 's' : ''}`);
    }

    // if the results list is winnowed down to a single record, display the record.
    if (nextProps.showSingleResult) {
      const oldCount = recordResource && recordResource.hasLoaded ? recordResource.other.totalRecords : '';
      const resource = nextProps.parentResources.records;
      const count = resource && resource.hasLoaded ? resource.other.totalRecords : '';
      if (count === 1 && oldCount > 1) {
        this.onSelectRow(null, resource.records[0]);
      }
    }
  }

  componentWillUnmount() {
    if (this.props.onComponentWillUnmount) {
      this.props.onComponentWillUnmount(this.props);
    }
  }

  queryParam = name => _.get(this.props.parentResources.query, name);

  onChangeSearch = (e) => {
    const query = e.target.value;
    this.props.parentMutator.resultCount.replace(this.props.initialResultCount);
    this.setState({ locallyChangedSearchTerm: query });
    this.performSearch(query);
  }

  // eslint-disable-next-line react/sort-comp
  performSearch = _.debounce((query) => {
    this.log('action', `searched for '${query}'`);
    this.transitionToParams({ query });
  }, 350);

  onClearSearch = () => {
    this.log('action', 'cleared search');
    this.setState({ locallyChangedSearchTerm: undefined });
    this.transitionToParams({ query: '', qindex: '' });

    // This allows the parent to reset other parameters like query index to
    // something that it may prefer instead of an empty qindex.
    if (this.props.filterChangeCallback) this.props.filterChangeCallback({});
  }

  onClearSearchQuery = () => {
    this.log('action', 'cleared search query');
    this.setState({ locallyChangedSearchTerm: undefined });
    this.transitionToParams({ query: '' });
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

  onChangeFilter = (e) => {
    this.props.parentMutator.resultCount.replace(this.props.initialResultCount);
    const newFilters = this.handleFilterChange(e);
    if (this.props.filterChangeCallback) this.props.filterChangeCallback(newFilters);
  }

  onClearFilter = (e) => {
    const newFilters = this.handleFilterClear(e);
    if (this.props.filterChangeCallback) this.props.filterChangeCallback(newFilters);
  }

  onClearSearchAndFilters = () => {
    this.log('action', 'cleared search and filters');

    this.setState({ locallyChangedSearchTerm: undefined });
    this.transitionToParams({ filters: this.initialFilters || '', query: '', qindex: '' });

    if (this.props.filterChangeCallback) this.props.filterChangeCallback({});
  }

  onNeedMore = () => {
    this.props.parentMutator.resultCount.replace(this.props.parentResources.resultCount + this.props.resultCountIncrement);
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

  addNewRecord = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "add new record"');
    this.transitionToParams({ layer: 'create' });
  }

  closeNewRecord = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close new record"');
    this.transitionToParams({ layer: null });
  }

  toggleNotes = () => {
    const show = this.queryParam('notes');
    this.transitionToParams({
      notes: show ? null : true,
    });
  }

  toggleFilterPane = () => {
    this.setState(prevState => ({ filterPaneIsVisible: !prevState.filterPaneIsVisible }));
  }

  collapseDetails = () => {
    this.setState({ selectedItem: {} });
    this.transitionToParams({ _path: `${this.props.packageInfo.stripes.route}/view` });
  }

  getRowURL(id) {
    const first = this.props.location.pathname.split('/')[1];
    return `/${first}/view/${id}${this.props.location.search}`;
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

  createRecord(record) {
    if (this.props.massageNewRecord) this.props.massageNewRecord(record);
    this.props.onCreate(record);
  }

  onEdit = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "edit"');
    this.transitionToParams({ layer: 'edit' });
  }

  onCloseEdit = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close edit"');
    this.transitionToParams({ layer: null });
  }

  renderResetButton = () => {
    const initialFilters = this.initialFilters || '';
    const currentFilters = this.queryParam('filters') || '';
    const filtersHaveChanged = currentFilters !== initialFilters;
    const searchTerm = this.state.locallyChangedSearchTerm || this.queryParam('query') || '';
    const searchIndex = this.queryParam('qindex') || '';
    const searchHasChanged = searchTerm !== '' || searchIndex !== '';

    if (!filtersHaveChanged && !searchHasChanged) return null;

    return (
      <Button buttonStyle="none" paddingSide0 onClick={this.onClearSearchAndFilters} style={{ fontWeight: 'bold' }}>
        <Icon size="small" icon="clearX" />
        <span>Reset all</span>
      </Button>
    );
  }

  render() {
    const { parentResources, filterConfig, disableFilters, newRecordPerms, viewRecordPerms, objectName, detailProps, packageInfo } = this.props;
    const analyzer = new ResourcesAnalyzer(parentResources, this.context.stripes.logger);
    const urlQuery = queryString.parse(this.props.location.search || '');
    const stripes = this.context.stripes;
    const objectNameUC = _.upperFirst(objectName);
    const resource = parentResources.records; // ### this is to be removed
    const records = analyzer.records();
    const searchTerm = this.state.locallyChangedSearchTerm || this.queryParam('query') || '';
    const searchIndex = this.queryParam('qindex') || '';
    const filters = filterState(this.queryParam('filters'));

    const moduleName = packageInfo.name.replace(/.*\//, '');
    const moduleTitle = packageInfo.stripes.displayName;
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
            title={`Add New ${objectNameUC}`}
            buttonStyle="primary paneHeaderNewButton"
            marginBottom0
          >+ New
          </Button>
        </PaneMenu>
      </IfPermission>
    );

    const { filterPaneIsVisible } = this.state;
    const filterCount = Object.keys(filters).length;
    const toggleFilterPaneMessage = `${filterPaneIsVisible ? 'Hide' : 'Show'} Search and Filters pane.\n\n${filterCount} applied filter${filterCount !== 1 ? 's' : ''}.`;

    const resultsFirstMenu = (
      <PaneMenu>
        <IconButton
          icon="search"
          ariaLabel={toggleFilterPaneMessage}
          title={toggleFilterPaneMessage}
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
              parentResources={this.props.parentResources}
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
            <h2>Permission Error</h2>
            <p>Sorry - your permissions do not allow access to this page.</p>
          </div>));

    const count = resource && resource.hasLoaded ? resource.other.totalRecords : '';
    const message = noRecordsMessage(resource, searchTerm);
    const sortOrder = this.queryParam('sort') || '';

    const createRecordLayer = (!this.props.editRecordComponent ? '' :
    <Layer isOpen={urlQuery.layer ? urlQuery.layer === 'create' : false} label={`Add New ${objectNameUC} Dialog`}>
      <this.props.editRecordComponent
        id={`${objectName}form-add${objectName}`}
        initialValues={this.props.newRecordInitialValues}
        onSubmit={record => this.createRecord(record)}
        onCancel={this.closeNewRecord}
        parentResources={this.props.parentResources}
        parentMutator={this.props.parentMutator}
        {...detailProps}
      />
    </Layer>);

    return (
      <Paneset>
        <SRStatus ref={(ref) => { this.SRStatus = ref; }} />
        {/* Filter Pane */}
        { filterPaneIsVisible ?
          <Pane
            id="pane-filter"
            dismissible
            defaultWidth="16%"
            paneTitle="Search & Filter"
            onClose={this.toggleFilterPane}
          >
            { this.renderResetButton() }
            <Accordion
              label="Search"
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
                loading={(resource && searchTerm) ? resource.isPending : false}
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
          paneTitle={moduleTitle}
          paneSub={stripes.intl.formatMessage({ id: `ui-${moduleName}.resultCount` }, { count })}
          lastMenu={!this.props.disableRecordCreation ? newRecordButton : null}
          firstMenu={resultsFirstMenu}
          noOverflow
        >
          <MultiColumnList
            id={`list-${moduleName}`}
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
            loading={resource ? resource.isPending : false}
            autosize
            virtualize
            ariaLabel={`${objectNameUC} search results`}
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

export default withRouter(SearchAndSort);

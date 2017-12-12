// A generalisation of the search-and-sort functionality that underlies searching-and-sorting modules

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import { withRouter } from 'react-router';
// eslint-disable-next-line import/no-unresolved
import { stripesShape } from '@folio/stripes-core/src/Stripes';
import queryString from 'query-string';
import FilterGroups, { filterState, handleFilterChange } from '@folio/stripes-components/lib/FilterGroups';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Layer from '@folio/stripes-components/lib/Layer';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import SRStatus from '@folio/stripes-components/lib/SRStatus';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import Notes from '../Notes';


function parsePath(s) {
  const i = s.indexOf('?');

  const path = (i < 0) ? s : s.substring(0, i);
  const search = (i < 0) ? '' : s.substring(i);
  const query = queryString.parse(search);
  query._path = path;
  return query;
}


class SearchAndSort extends React.Component {
  static contextTypes = {
    stripes: stripesShape.isRequired,
  };

  static propTypes = {
    // parameter properties provided by caller
    moduleName: PropTypes.string.isRequired, // machine-readable, for HTML ids and translation keys
    moduleTitle: PropTypes.string.isRequired, // human-readable
    objectName: PropTypes.string.isRequired, // machine-readable
    baseRoute: PropTypes.string.isRequired,
    initialPath: PropTypes.string.isRequired,
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
    initialResultCount: PropTypes.number.isRequired,
    resultCountIncrement: PropTypes.number.isRequired,
    viewRecordComponent: PropTypes.func.isRequired,
    editRecordComponent: PropTypes.func,
    newRecordInitialValues: PropTypes.object,
    visibleColumns: PropTypes.arrayOf(
      PropTypes.string,
    ),
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

    // react-route properties provided by withRouter
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
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
    };

    this.transitionToParams = values => this.props.parentMutator.query.update(values);
    this.handleFilterChange = handleFilterChange.bind(this);
    this.connectedViewRecord = context.stripes.connect(props.viewRecordComponent);
    this.connectedNotes = context.stripes.connect(Notes);
    this.SRStatus = null;

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
      const resultAmount = nextProps.parentResources.records.other.totalRecords;
      this.SRStatus.sendMessage(`Search returned ${resultAmount} result${resultAmount !== 1 ? 's' : ''}`);
    }
  }

  queryParam(name) {
    return _.get(this.props.parentResources.query, name);
  }

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
    const newParams = parsePath(this.props.initialPath);
    this.props.parentMutator.query.replace(newParams);
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

    const sortOrder = orders.slice(0, 2).join(',');
    this.log('action', `sorted by ${sortOrder}`);
    this.transitionToParams({ sort: sortOrder });
  }

  onChangeFilter = (e) => {
    this.props.parentMutator.resultCount.replace(this.props.initialResultCount);
    this.handleFilterChange(e);
  }

  onNeedMore = () => {
    this.props.parentMutator.resultCount.replace(this.props.parentResources.resultCount + this.props.resultCountIncrement);
  }

  onSelectRow = this.props.onSelectRow ? this.props.onSelectRow : (e, meta) => {
    this.log('action', `clicked ${meta.id}, selected record =`, meta);
    this.setState({ selectedItem: meta });
    this.transitionToParams({ _path: `${this.props.baseRoute}/view/${meta.id}` });
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
    this.props.parentMutator.query.update({
      notes: show ? null : true,
    });
  }

  collapseDetails = () => {
    this.setState({ selectedItem: {} });
    this.transitionToParams({ _path: `${this.props.baseRoute}/view` });
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
      labelStrings,
    },
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

  render() {
    const { parentResources, filterConfig, moduleName, newRecordPerms, viewRecordPerms, objectName } = this.props;
    const urlQuery = queryString.parse(this.props.location.search || '');
    const stripes = this.context.stripes;
    const objectNameUC = _.upperFirst(objectName);
    const records = (parentResources.records || {}).records || [];
    const resource = parentResources.records;
    const searchTerm = this.state.locallyChangedSearchTerm || this.queryParam('query');

    /* searchHeader is a 'custom pane header' */
    const searchHeader = (<FilterPaneSearch
      searchFieldId={`input-${objectName}-search`}
      onChange={this.onChangeSearch}
      onClear={this.onClearSearch}
      resultsList={this.resultsList}
      value={searchTerm}
      placeholder={stripes.intl.formatMessage({ id: `ui-${moduleName}.search` })}
    />);

    const newRecordButton = !newRecordPerms ? '' : (
      <IfPermission perm={newRecordPerms}>
        <PaneMenu>
          <Button id={`clickable-new${objectName}`} title={`Add New ${objectNameUC}`} onClick={this.addNewRecord} buttonStyle="primary paneHeaderNewButton">+ New</Button>
        </PaneMenu>
      </IfPermission>
    );

    const detailsPane = (
      stripes.hasPerm(viewRecordPerms) ?
        (<Route
          path={`${this.props.match.path}/view/:id`}
          render={props => <this.connectedViewRecord
            stripes={stripes}
            paneWidth="44%"
            parentResources={this.props.parentResources}
            parentMutator={this.props.parentMutator}
            onClose={this.collapseDetails}
            onEdit={this.onEdit}
            onCloseEdit={this.onCloseEdit}
            notesToggle={this.toggleNotes}
            {...props}
          />}
        />) :
        (<div
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

    const maybeTerm = searchTerm ? ` for "${searchTerm}"` : '';
    const maybeSpelling = searchTerm ? 'spelling and ' : '';
    const count = resource && resource.hasLoaded ? resource.other.totalRecords : '';
    const sortOrder = this.queryParam('sort') || '';
    const filters = filterState(this.queryParam('filters'));

    return (
      <Paneset>
        <SRStatus ref={(ref) => { this.SRStatus = ref; }} />
        {/* Filter Pane */}
        <Pane id="pane-filter" defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={filters} onChangeFilter={this.onChangeFilter} />
        </Pane>
        {/* Results Pane */}
        <Pane
          id="pane-results"
          defaultWidth="fill"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>{this.props.moduleTitle}</strong>
              <div>
                <em>{stripes.intl.formatMessage({ id: `ui-${moduleName}.resultCount` }, { count })}</em>
              </div>
            </div>
          }
          lastMenu={!this.props.disableRecordCreation ? newRecordButton : null}
          noOverflow
        >
          <MultiColumnList
            id={`list-${this.props.moduleName}`}
            contentData={records}
            selectedRow={this.state.selectedItem}
            formatter={this.props.resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            onNeedMoreData={this.onNeedMore}
            visibleColumns={this.props.visibleColumns}
            sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
            sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
            isEmptyMessage={`No results found${maybeTerm}. Please check your ${maybeSpelling}filters.`}
            columnMapping={this.props.columnMapping}
            loading={resource ? resource.isPending : false}
            autosize
            virtualize
            ariaLabel={`${objectNameUC} search results`}
            rowFormatter={this.anchoredRowFormatter}
            containerRef={(ref) => { this.resultsList = ref; }}
          />
        </Pane>

        {detailsPane}
        {
          !this.props.editRecordComponent ? '' :
          <Layer isOpen={urlQuery.layer ? urlQuery.layer === 'create' : false} label={`Add New ${objectNameUC} Dialog`}>
            <this.props.editRecordComponent
              id={`${objectName}form-add${objectName}`}
              initialValues={this.props.newRecordInitialValues}
              onSubmit={record => this.createRecord(record)}
              onCancel={this.closeNewRecord}
              parentResources={this.props.parentResources}
              parentMutator={this.props.parentMutator}
            />
          </Layer>
          }
        {
          _.get(this.props.parentResources.query, 'notes') &&
          <Route
            path={`${this.props.match.path}/view/:id`}
            render={props => <this.connectedNotes
              stripes={stripes}
              onToggle={this.toggleNotes}
              link={`${this.props.moduleName}/${props.match.params.id}`}
              {...props}
            />}
          />
          }
      </Paneset>
    );
  }
}

export default withRouter(SearchAndSort);

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  get,
  pick,
} from 'lodash';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import {
  stripesConnect,
  IfPermission
} from '@folio/stripes-core';

import {
  sortOrders,
  notesStatuses,
  assigningModalColumnsConfig,
  notesColumnNames,
} from '../constants';
import NotesAccordion from '../components/NotesAccordion';

import { getSearchParamsString } from './utils';

const {
  ASC,
  DESC,
} = sortOrders;

const {
  ASSIGNED,
  UNASSIGNED,
} = notesStatuses;

const LIMIT = '100000';
const PATH = 'note-links/domain/!{domainName}/type/!{entityType}/id/!{entityId}';

const searchQueryParams = {
  [notesColumnNames.DATE]: 'updatedDate',
  [notesColumnNames.TITLE_AND_DETAILS]: 'title',
  [notesColumnNames.TYPE]: 'noteType',
};
@stripesConnect
class NotesSmartAccordion extends Component {
  static propTypes = {
    domainName: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
    entityId: PropTypes.string.isRequired,
    entityName: PropTypes.string.isRequired,
    entityType: PropTypes.string.isRequired,
    headerProps: PropTypes.object,
    hideAssignButton: PropTypes.bool,
    history: PropTypes.object.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    mutator: PropTypes.object.isRequired,
    onToggle: PropTypes.func,
    open: PropTypes.bool,
    pathToNoteCreate: PropTypes.string.isRequired,
    pathToNoteDetails: PropTypes.string.isRequired,
    referredRecordData: PropTypes.object,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
  }

  static defaultProps = {
    hideAssignButton: false,
    label: <FormattedMessage id="stripes-smart-components.notes" />,
    referredRecordData: {},
  };

  static manifest = Object.freeze({
    assignedNotes: {
      type: 'okapi',
      accumulate: true,
      fetch: false,
      path: PATH,
      GET: {
        params: {
          status: ASSIGNED,
          limit: LIMIT,
          order: DESC,
          orderBy: searchQueryParams[notesColumnNames.DATE],
        },
      },
    },
    domainNotes: {
      type: 'okapi',
      accumulate: true,
      fetch: false,
      GET: {
        limit: LIMIT,
        path: PATH,
      },
      PUT: {
        path: 'note-links/type/!{entityType}/id/!{entityId}',
      },
    },
    noteTypes: {
      type: 'okapi',
      accumulate: true,
      fetch: false,
      GET: {
        path: 'note-types',
        params: {
          query: 'cql.allRecords=1 sortby name',
          limit: '500',
        },
      },
    }
  });

  state = {
    sortParams: {
      order: ASC,
      by: assigningModalColumnsConfig.names.TITLE,
    },
    sortedColumn: {
      column: notesColumnNames.DATE,
      isDesc: true,
    },
  };

  componentDidMount() {
    if (this.props.stripes.hasPerm('ui-notes.item.view')) {
      this.props.mutator.noteTypes.reset();
      this.props.mutator.assignedNotes.GET();
      this.props.mutator.noteTypes.GET();
    }
  }

  getAssignedNotes = () => {
    const lastRequestIndex = get(this.props, 'resources.assignedNotes.records.length', 1) - 1;
    const items = get(this.props, `resources.assignedNotes.records[${lastRequestIndex}].notes`, [])
      .map((note) => {
        const id = get(note, 'id');
        const title = get(note, 'title');
        const content = get(note, 'content');
        const updatedDate = get(note, 'metadata.updatedDate');
        const noteType = this.getNoteTypes()
          .find(nt => get(nt, 'id') === get(note, 'typeId'));

        return {
          id,
          lastSavedDate: updatedDate,
          title,
          content,
          type: get(noteType, 'name'),
        };
      });

    return {
      items,
      loading: get(this.props, 'resources.assignedNotes.isPending'),
    };
  }

  getDomainNotes = () => {
    const {
      entityType,
      entityId,
    } = this.props;

    const {
      sortParams,
    } = this.state;

    const items = get(this.props, 'resources.domainNotes.records', [])
      .reduce((acc, notesObj) => {
        acc.push(...notesObj.notes);
        return acc;
      }, [])
      .map((domainNote) => {
        const isAssigned = get(domainNote, 'links')
          .find(({ type, id }) => type === entityType && id === entityId);
        const status = isAssigned ? ASSIGNED : UNASSIGNED;

        return {
          ...pick(domainNote, ['id', 'title']),
          status,
          linksNumber: domainNote.links.length,
        };
      });

    return {
      items,
      sortParams,
      loading: get(this.props, 'resources.domainNotes.isPending'),
      totalCount: get(this.props, 'resources.domainNotes.records[0].totalRecords')
    };
  }

  fetchDomainNotes = (params) => {
    const {
      domainName,
      entityType,
      entityId,
    } = this.props;
    const { sortParams } = this.state;

    const searchParamsString = getSearchParamsString({
      ...params,
      sortParams,
      limit: LIMIT,
    });
    const path = `note-links/domain/${domainName}/type/${entityType}/id/${entityId}`;

    this.props.mutator.domainNotes.GET({
      path: `${path}?${searchParamsString}`,
    });
  }

  fetchAssignedNotes = () => {
    const { sortedColumn } = this.state;

    this.props.mutator.assignedNotes.GET({
      params: {
        status: ASSIGNED,
        limit: LIMIT,
        orderBy: searchQueryParams[sortedColumn.column],
        order: sortedColumn.isDesc ? DESC : ASC,
      }
    });
  }

  onHeaderClick = (event, { name: column }) => {
    this.setState(({ sortedColumn }) => {
      const isChangeDirection = sortedColumn.column === column;
      const newItemsSorting = {
        column,
        isDesc: isChangeDirection ? !sortedColumn.isDesc : true,
      };

      return { sortedColumn: newItemsSorting };
    }, this.fetchAssignedNotes);
  }

  onSortDomainNotes = ({ sortParams, query, selectedStatusFilters, selectedNoteTypeFilters }) => {
    this.setState({ sortParams }, () => {
      this.props.mutator.domainNotes.reset();
      this.fetchDomainNotes({ query, selectedStatusFilters, selectedNoteTypeFilters });
    });
  }

  onSaveAssigningResults = (noteIdToStatusMap) => {
    const notes = [];

    noteIdToStatusMap.forEach((status, id) => {
      notes.push({
        id,
        status: status.toUpperCase(),
      });
    });

    this.props.mutator.domainNotes
      .PUT({ notes })
      .then(() => {
        this.props.mutator.assignedNotes.GET();
      });
  }

  onSearch = params => {
    const {
      query = '',
      selectedStatusFilters = [],
      selectedNoteTypeFilters = [],
    } = params;

    this.props.mutator.domainNotes.reset();

    const searchQueryAndFiltersAreEmpty = query === ''
      && selectedStatusFilters.length === 0
      && selectedNoteTypeFilters.length === 0;

    if (searchQueryAndFiltersAreEmpty) {
      return;
    }

    this.fetchDomainNotes({ query, selectedStatusFilters, selectedNoteTypeFilters });
  }

  onNoteCreateButtonClick = () => {
    const {
      pathToNoteCreate,
      entityName,
      entityType,
      entityId,
      history,
      referredRecordData,
    } = this.props;

    history.push({
      pathname: pathToNoteCreate,
      state: {
        entityName,
        entityType,
        entityId,
        referredRecordData,
      },
    });
  }

  redirectToNotePage = (pathname) => {
    const {
      history,
      entityName,
      entityType,
      entityId,
      referredRecordData,
    } = this.props;

    history.push({
      pathname: `${pathname}`,
      state: {
        entityName,
        entityType,
        entityId,
        referredRecordData,
      },
    });
  }

  onAssignedNoteClick = (event, note) => {
    const { pathToNoteDetails } = this.props;

    this.redirectToNotePage(`${pathToNoteDetails}/${note.id}`);
  }

  onAssignedNoteEditClick = (event, note) => {
    const { pathToNoteDetails } = this.props;

    this.redirectToNotePage(`${pathToNoteDetails}/${note.id}/edit`);
  }

  getNoteTypes() {
    return get(this.props, ['resources', 'noteTypes', 'records', 0, 'noteTypes'], []);
  }

  getNoteTypeNames() {
    return this.getNoteTypes().map(nt => nt.name);
  }

  render() {
    const {
      entityName,
      entityType,
      entityId,
      mutator,
      onToggle,
      open,
      id,
      hideAssignButton,
      label,
      headerProps,
    } = this.props;

    const { sortedColumn } = this.state;

    return (
      <IfPermission perm="ui-notes.item.view">
        <NotesAccordion
          assignedNotes={this.getAssignedNotes()}
          domainNotes={this.getDomainNotes()}
          noteTypes={this.getNoteTypeNames()}
          onNoteCreateButtonClick={this.onNoteCreateButtonClick}
          onAssignedNoteClick={this.onAssignedNoteClick}
          onAssignedNoteEditClick={this.onAssignedNoteEditClick}
          entityName={entityName}
          entityType={entityType}
          entityId={entityId}
          onResetSearchResults={mutator.domainNotes.reset}
          onSaveAssigningResults={this.onSaveAssigningResults}
          onSearch={this.onSearch}
          onSortDomainNotes={this.onSortDomainNotes}
          fetchDomainNotes={this.fetchDomainNotes}
          id={id}
          open={open}
          hideAssignButton={hideAssignButton}
          onToggle={onToggle}
          label={label}
          onHeaderClick={this.onHeaderClick}
          sortedColumn={sortedColumn.column}
          sortDirection={sortedColumn.isDesc ? 'descending' : 'ascending'}
          headerProps={headerProps}
        />
      </IfPermission>
    );
  }
}

export default withRouter(NotesSmartAccordion);

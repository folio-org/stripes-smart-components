import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  get,
  pick,
} from 'lodash';
import { withRouter } from 'react-router-dom';

import {
  stripesConnect,
  IfPermission
} from '@folio/stripes-core';

import {
  sortOrders,
  notesStatuses,
} from '../constants';
import NotesAccordion from '../components/NotesAccordion';

import { makeSearchQuery } from './utils';

const { ASC } = sortOrders;

const {
  ASSIGNED,
  UNASSIGNED,
} = notesStatuses;

const LIMIT = '20';
const NOTES_PATH = 'notes';

@stripesConnect
class NotesSmartAccordion extends Component {
  static propTypes = {
    domainName: PropTypes.string.isRequired,
    entityId: PropTypes.string.isRequired,
    entityName: PropTypes.string.isRequired,
    entityType: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    mutator: PropTypes.object.isRequired,
    onToggle: PropTypes.func.isRequired,
    open: PropTypes.bool,
    pathToNoteCreate: PropTypes.string.isRequired,
    pathToNoteDetails: PropTypes.string.isRequired,
  }

  static manifest = Object.freeze({
    assignedNotes: {
      type: 'okapi',
      accumulate: true,
      path: NOTES_PATH,
      GET: {
        params: {
          query: 'domain=!{domainName} and linkTypes=!{entityType} and linkIds=!{entityId}',
          limit: LIMIT,
        }
      },
    },
    domainNotes: {
      type: 'okapi',
      accumulate: true,
      path: NOTES_PATH,
      fetch: false,
      PUT: {
        path: 'note-links/type/!{entityType}/id/!{entityId}'
      }
    }
  });

  state = {
    sortParams: {
      order: ASC,
      by: 'title',
    }
  };

  componentDidMount() {
    this.props.mutator.assignedNotes.GET();
  }

  getAssignedNotes = () => {
    const lastRequestIndex = get(this.props, 'resources.assignedNotes.records.length', 1) - 1;
    const items = get(this.props, `resources.assignedNotes.records[${lastRequestIndex}].notes`, [])
      .map((assignedNote) => {
        const id = get(assignedNote, 'id');
        const title = get(assignedNote, 'title');
        const updatedDate = get(assignedNote, 'metadata.updatedDate');
        const updaterPropertyName = get(assignedNote, 'updater') ? 'updater' : 'creator';

        const firstName = get(assignedNote, `${updaterPropertyName}.firstName`);
        const lastName = get(assignedNote, `${updaterPropertyName}.lastName`);

        return {
          id,
          lastSavedDate: updatedDate,
          lastSavedUserFullName: `${lastName} ${firstName}`,
          title,
        };
      });

    return {
      items,
      loading: get(this.props, 'resources.assignedNotes.isPending'),
    };
  }

  getDomainNotes = () => {
    const {
      sortParams,
    } = this.state;

    const {
      entityType,
      entityId,
    } = this.props;

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

    const {
      offset,
    } = params;

    const { sortParams } = this.state;

    this.props.mutator.domainNotes.GET({
      params: {
        query: makeSearchQuery({
          ...params,
          sortParams,
          domainName,
          entity: {
            type: entityType,
            id: entityId,
          },
        }),
        limit: LIMIT,
        offset,
      }
    });
  }

  onSortDomainNotes = ({ sortParams, query, selectedStatusFilters }) => {
    this.setState({ sortParams }, () => {
      this.props.mutator.domainNotes.reset();
      this.fetchDomainNotes({ query, selectedStatusFilters });
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

  onSearch = ({ query = '', selectedStatusFilters = [] }) => {
    this.props.mutator.domainNotes.reset();

    if (query === '' && selectedStatusFilters.length === 0) {
      return;
    }

    this.fetchDomainNotes({ query, selectedStatusFilters });
  }

  onNoteCreateButtonClick = () => {
    const {
      pathToNoteCreate,
      entityName,
      entityType,
      entityId,
      history,
    } = this.props;

    history.push({
      pathname: pathToNoteCreate,
      state: {
        entityName,
        entityType,
        entityId,
      },
    });
  }

  onAssignedNoteClick = (event, note) => {
    const {
      history,
      pathToNoteDetails,
      entityName,
      entityType,
      entityId,
    } = this.props;

    history.push({
      pathname: `${pathToNoteDetails}/${note.id}`,
      state: {
        entityName,
        entityType,
        entityId,
      },
    });
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
    } = this.props;

    return (
      <IfPermission perm="ui-notes.item.view">
        <NotesAccordion
          assignedNotes={this.getAssignedNotes()}
          domainNotes={this.getDomainNotes()}
          onNoteCreateButtonClick={this.onNoteCreateButtonClick}
          onAssignedNoteClick={this.onAssignedNoteClick}
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
          onToggle={onToggle}
        />
      </IfPermission>
    );
  }
}

export default withRouter(NotesSmartAccordion);

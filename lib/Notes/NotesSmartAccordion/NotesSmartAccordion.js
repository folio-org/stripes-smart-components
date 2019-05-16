import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  get,
  pick,
} from 'lodash';
import { withRouter } from 'react-router-dom';

import {
  stripesConnect,
} from '@folio/stripes-core';

import {
  sortOrders,
  notesStatuses,
} from '../constants';
import NotesAccordion from '../NotesAccordion';

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
    mutator: PropTypes.object.isRequired,
    pathToNoteCreate: PropTypes.string.isRequired,
    pathToNoteDetails: PropTypes.string.isRequired,
  }

  static manifest = Object.freeze({
    assignedNotes: {
      type: 'okapi',
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
    accordionIsOpen: true,
    sortParams: {
      order: ASC,
      by: 'title',
    }
  };

  getAssignedNotes = () => {
    const items = get(this.props, 'resources.assignedNotes.records[0].notes', [])
      .map((assignedNote) => {
        const id = get(assignedNote, 'id');
        const title = get(assignedNote, 'title');
        const updatedDate = get(assignedNote, 'metadata.updatedDate');
        const firstName = get(assignedNote, 'creator.firstName');
        const lastName = get(assignedNote, 'creator.lastName');

        return {
          id,
          lastSavedDate: updatedDate,
          lastSavedUserFullName: `${firstName} ${lastName}`,
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

    this.props.mutator.domainNotes.PUT({ notes });
  }

  onSearch = ({ query = '', selectedStatusFilters = [] }) => {
    this.props.mutator.domainNotes.reset();
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

  onAssignedNoteClick = (e, note) => {
    const {
      history,
      pathToNoteDetails,
    } = this.props;

    history.push({
      pathname: `${pathToNoteDetails}/${note.id}`,
    });
  }

  render() {
    const {
      entityName,
      entityType,
      entityId,
      mutator,
    } = this.props;

    return (
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
        open={this.state.accordionIsOpen}
      />
    );
  }
}

export default withRouter(NotesSmartAccordion);

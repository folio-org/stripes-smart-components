import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  get,
  pick,
} from 'lodash';

import {
  stripesConnect,
} from '@folio/stripes-core';

import {
  sortOrders,
  notesStatuses,
} from '../constants';
import NotesAccordion from '../NotesAccordion';

const {
  ASC,
} = sortOrders;

const {
  ASSIGNED,
  UNASSIGNED,
} = notesStatuses;

const LIMIT = '20';
const NOTES_PATH = 'notes';
const STATUS_FILTERS_NUMBER = 2;


export default @stripesConnect class NotesSmartAccordion extends Component {
  static propTypes = {
    domainName: PropTypes.string.isRequired,
    entityId: PropTypes.string.isRequired,
    entityType: PropTypes.string.isRequired,
    mutator: PropTypes.object.isRequired,
    onAssignedNoteClick: PropTypes.func,
    onCreate: PropTypes.func,
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
      dataSetIndexToStartWith,
    } = this.state;

    const {
      entityType,
      entityId,
    } = this.props;

    const items = get(this.props, 'resources.domainNotes.records', [])
      .slice(dataSetIndexToStartWith)
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

  fetchDomainNotes = async (params) => {
    const {
      offset,
      dataSetIndexToStartWith,
    } = params;

    await this.props.mutator.domainNotes.GET({
      params: {
        query: this.makeSearchQuery(params),
        limit: LIMIT,
        offset,
      }
    });

    this.setState({ dataSetIndexToStartWith });
  }

  makeSearchQuery = (params) => {
    const {
      selectedStatusFilters,
      query,
    } = params;

    const { sortParams } = this.state;

    const {
      domainName,
      entityType,
      entityId,
    } = this.props;

    const sortQuery = ` sortBy ${sortParams.by}/sort.${sortParams.order}`;
    let searchQuery = `domain=${domainName} and title="${query}"`;
    const onlyOneOfTheStatusFiltersIsSelected = selectedStatusFilters.length > 0
      && selectedStatusFilters.length !== STATUS_FILTERS_NUMBER;

    if (onlyOneOfTheStatusFiltersIsSelected) {
      searchQuery += selectedStatusFilters.reduce((string, status) => {
        let assignmentStatusQueryString = string;
        const assignmentStatusQuery = `linkTypes=${entityType} and linkIds=/respectCase/respectAccents ${entityId}`;

        if (status === ASSIGNED) {
          assignmentStatusQueryString += ` and ${assignmentStatusQuery}`;
        } else {
          assignmentStatusQueryString += ` NOT (${assignmentStatusQuery})`;
        }

        return `${assignmentStatusQueryString}`;
      }, '');
    }

    searchQuery += sortQuery;

    return searchQuery;
  }

  onSortDomainNotes = ({ sortParams, query, selectedStatusFilters }) => {
    const dataSetIndexToStartWith = get(this.props, 'resources.domainNotes.records.length', 0);

    this.setState({ sortParams }, () => {
      this.fetchDomainNotes({ query, selectedStatusFilters, dataSetIndexToStartWith });
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
    const dataSetIndexToStartWith = get(this.props, 'resources.domainNotes.records.length', 0);

    this.fetchDomainNotes({ query, selectedStatusFilters, dataSetIndexToStartWith });
  }

  render() {
    const {
      onAssignedNoteClick,
      onCreate,
      mutator,
    } = this.props;

    return (
      <NotesAccordion
        assignedNotes={this.getAssignedNotes()}
        domainNotes={this.getDomainNotes()}
        onCreate={onCreate}
        onNoteClick={onAssignedNoteClick}
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

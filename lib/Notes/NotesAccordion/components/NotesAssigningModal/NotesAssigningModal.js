import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

/* eslint-disable import/no-extraneous-dependencies */
import {
  Modal,
  Paneset,
  Pane,
  MultiColumnList,
  Button,
  SearchField,
  Checkbox,
  Accordion,
  Headline,
  IconButton,
} from '@folio/stripes/components'; // eslint-disable-line import/no-unresolved
/* eslint-enable import/no-extraneous-dependencies */

import { SearchAndSortResetButton as ResetButton, CheckboxFilter } from '../../../../..';

import { notesStatuses, sortOrders } from '../../constants';

import styles from './NotesAssigningModal.css';

const {
  ASSIGNED,
  UNASSIGNED,
} = notesStatuses;

const {
  ASC,
  DESC,
} = sortOrders;

const notesStatusOptions = [
  {
    label: <FormattedMessage id="stripes-smart-components.assigned" />,
    value: ASSIGNED,
  },
  {
    label: <FormattedMessage id="stripes-smart-components.unassigned" />,
    value: UNASSIGNED,
  },
];

const columnWidths = { assigning: '5%' };

const noteShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  status: PropTypes.oneOf([ASSIGNED, UNASSIGNED]),
  title: PropTypes.node.isRequired,
});

const notesShape = PropTypes.shape({
  items: PropTypes.arrayOf(noteShape),
  sort: PropTypes.shape({
    by: PropTypes.string,
    order: PropTypes.oneOf([ASC, DESC]),
  }),
  totalCount: PropTypes.number,
});

export default class NotesAssigningModal extends React.Component {
  static propTypes = {
    notes: notesShape,
    onClose: PropTypes.func.isRequired,
    onNeedMore: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    onSort: PropTypes.func.isRequired,
    open: PropTypes.bool,
  };

  static defaultProps = {
    notes: {
      totalCount: 0,
      items: [],
      sort: {
        order: ASC,
        by: 'title',
      },
    },
    open: false,
  };

  state = {
    selectedStatusFilters: [],
    searchQuery: '',
    changedNoteIdToStatusMap: new Map(),
  };

  getNewChangedNoteIdToStatusMap = (state, note, notes) => {
    const { changedNoteIdToStatusMap } = state;

    const incomingNoteStatus = notes.find((curNote) => curNote.id === note.id).status;
    const newStatus = note.status === ASSIGNED ? UNASSIGNED : ASSIGNED;
    const newChangedNoteIdToStatusMap = new Map(changedNoteIdToStatusMap);

    if (incomingNoteStatus === newStatus) {
      newChangedNoteIdToStatusMap.delete(note.id);
    } else {
      newChangedNoteIdToStatusMap.set(note.id, newStatus);
    }

    return newChangedNoteIdToStatusMap;
  };

  onSingleAssignClickHandler = (note) => {
    this.setState((state, props) => {
      return {
        changedNoteIdToStatusMap: this.getNewChangedNoteIdToStatusMap(state, note, props.notes.items),
      };
    });
  };

  resultsFormatter = {
    assigning: (record) => {
      const isAssigned = record.status === ASSIGNED;

      return (
        <Checkbox
          role="button"
          checked={isAssigned}
          onClick={() => this.onSingleAssignClickHandler(record)}
        />
      );
    },
  };

  onStatusFilterChange = (filter) => {
    this.setState(
      { selectedStatusFilters: [...filter.values] },
      () => {
        this.props.onSearch({
          query: this.state.searchQuery,
          assignmentStatuses: this.state.selectedStatusFilters,
        });
      }
    );
  };

  getNotes = () => {
    const { changedNoteIdToStatusMap } = this.state;

    return this.props.notes.items.map((curNote) => {
      return changedNoteIdToStatusMap.has(curNote.id)
        ? { ...curNote, status: changedNoteIdToStatusMap.get(curNote.id) }
        : curNote;
    });
  };

  onSaveAndCloseHandler = () => {
    this.props.onSave(this.state.changedNoteIdToStatusMap);
  }

  renderFooter() {
    return (
      <Fragment>
        <Button onClick={this.props.onClose}>
          <FormattedMessage id="stripes-smart-components.cancel" />
        </Button>
        <Button
          onClick={this.onSaveAndCloseHandler}
          buttonClass={styles['save-button']}
        >
          <FormattedMessage id="stripes-smart-components.saveAndClose" />
        </Button>
      </Fragment>
    );
  }

  onFiltersResetHandler = () => {
    this.setState({
      selectedStatusFilters: [],
    });

    this.props.onSearch({
      assignmentStatuses: [],
    });
  }

  onSearchByQueryHandler = () => {
    const {
      searchQuery,
      selectedStatusFilters,
    } = this.state;

    this.props.onSearch({
      query: searchQuery,
      assignmentStatuses: selectedStatusFilters,
    });
  }

  onSearchQueryChangeHandler = (event) => {
    this.setState({ searchQuery: event.target.value });
  }

  onResetAllHandler = () => {
    this.setState({
      searchQuery: '',
      selectedStatusFilters: [],
    });

    this.props.onSearch({
      query: '',
      assignmentStatuses: [],
    });
  }

  onAssignAllClickHandler = (event) => {
    const { checked } = event.target;

    this.setState((state) => {
      const newStatus = checked ? ASSIGNED : UNASSIGNED;
      const newChangedNoteIdToStatusMap = new Map(state.changedNoteIdToStatusMap);

      this.props.notes.items.forEach((curIncomingNote) => {
        if (curIncomingNote.status !== newStatus) {
          newChangedNoteIdToStatusMap.set(curIncomingNote.id, newStatus);
        } else {
          newChangedNoteIdToStatusMap.delete(curIncomingNote.id);
        }
      });

      return {
        changedNoteIdToStatusMap: newChangedNoteIdToStatusMap,
      };
    });
  }

  getSortParams = (columnName) => {
    const {
      notes: { sortParams }
    } = this.props;
    const columnIsChanged = columnName !== sortParams.by;

    const sortOrder = columnIsChanged
      ? ASC
      : sortParams.order === ASC ? DESC : ASC;

    return {
      order: sortOrder,
      by: columnName,
    };
  };

  onColumnHeaderClickHandler = (event, column) => {
    if (column.name === 'assigning') return;

    this.props.onSort(this.getSortParams(column.name));
  }

  getColumnMapping = () => {
    return {
      assigning: (
        <Checkbox
          role="button"
          name="assigning"
          className={styles['assign-checkbox']}
          onClick={this.onAssignAllClickHandler}
        />
      ),
      title: <FormattedMessage id="stripes-smart-components.title" />,
      status: <FormattedMessage id="stripes-smart-components.status" />,
    };
  }

  renderResetFiltersButton() {
    return (
      <IconButton
        size="small"
        iconSize="small"
        icon="times-circle-solid"
        onClick={this.onFiltersResetHandler}
      />
    );
  }

  render() {
    const { open, notes, onClose, onNeedMore } = this.props;
    const { searchQuery, selectedStatusFilters } = this.state;

    const searchOptionsIsEmpty = this.state.searchQuery.length === 0 && this.state.selectedStatusFilters.length === 0;
    const thereAreSelectedFilters = selectedStatusFilters.length > 0;

    return (
      <Modal
        size="large"
        open={open}
        label={<FormattedMessage id="stripes-smart-components.notes.assignNote" />}
        onClose={onClose}
        footer={this.renderFooter()}
        dismissible
      >
        <div>
          <Paneset id="notes-modal-paneset" static>
            <Pane
              defaultWidth="30%"
              paneTitle={<FormattedMessage id="stripes-smart-components.searchAndFilter" />}
            >
              <SearchField
                aria-label={<FormattedMessage id="stripes-smart-components.notes.noteSearch" />}
                name="query"
                onChange={this.onSearchQueryChangeHandler}
                value={searchQuery}
                marginBottom0
                autoFocus
                className={styles['search-field']}
              />
              <Button
                type="submit"
                buttonStyle="primary"
                fullWidth
                disabled={searchQuery === ''}
                onClick={this.onSearchByQueryHandler}
              >
                <FormattedMessage id="stripes-smart-components.search" />
              </Button>
              <div>
                <ResetButton
                  label={<FormattedMessage id="stripes-smart-components.resetAll" />}
                  disabled={searchOptionsIsEmpty}
                  onClick={this.onResetAllHandler}
                />
              </div>

              <Accordion
                id="notes-status"
                closedByDefault={false}
                label={
                  <Headline size="large" tag="h3">
                    <FormattedMessage id="stripes-smart-components.notes.noteAssignmentStatus" />
                  </Headline>
                }
                displayWhenOpen={thereAreSelectedFilters && this.renderResetFiltersButton()}
              >
                <CheckboxFilter
                  dataOptions={notesStatusOptions}
                  name="notesStatus"
                  selectedValues={selectedStatusFilters}
                  onChange={this.onStatusFilterChange}
                />
              </Accordion>
            </Pane>
            <Pane
              paneTitle={<FormattedMessage id="stripes-smart-components.notes" />}
              paneSub={(
                <FormattedMessage
                  id="stripes-smart-components.notes.found"
                  values={{ quantity: notes.totalCount }}
                />
              )}
              defaultWidth="70%"
            >
              <MultiColumnList
                visibleColumns={['assigning', 'title', 'status']}
                contentData={this.getNotes()}
                totalCount={notes.totalCount}
                columnMapping={this.getColumnMapping()}
                columnWidths={columnWidths}
                onHeaderClick={this.onColumnHeaderClickHandler}
                sortOrder={notes.sortParams.by}
                sortDirection={notes.sortParams.order}
                isEmptyMessage={<FormattedMessage id="stripes-smart-components.notes.notFound" />}
                formatter={this.resultsFormatter}
                virtualize
                onNeedMoreData={onNeedMore}
              />
            </Pane>
          </Paneset>
        </div>
      </Modal>
    );
  }
}

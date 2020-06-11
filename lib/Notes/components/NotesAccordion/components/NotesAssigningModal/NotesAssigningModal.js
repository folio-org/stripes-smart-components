import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  get,
  debounce,
} from 'lodash';

import {
  Modal,
  Paneset,
  Pane,
  MultiColumnList,
  Button,
  SearchField,
  Checkbox,
  Accordion,
  AccordionSet,
  Headline,
  IconButton,
  Layout,
} from '@folio/stripes-components';

import {
  SearchAndSortResetButton as ResetButton,
  CheckboxFilter,
  MultiSelectionFilter,
} from '../../../../../..';

import {
  notesStatuses,
  sortOrders,
  NOTE_LINKS_MIN_NUMBER,
  assigningModalColumnsConfig,
} from '../../../../constants';

import css from './NotesAssigningModal.css';

const {
  ASSIGNED,
  UNASSIGNED,
} = notesStatuses;

const {
  names: columnNames,
  widths: columnWidths,
} = assigningModalColumnsConfig;

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

const DEBOUNCE_TIME_FOR_SETTING_QUERY = 200;
const sortOrderToDirectionMap = new Map([
  [ASC, 'ascending'],
  [DESC, 'descending']
]);

const noteShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  linksNumber: PropTypes.number.isRequired,
  status: PropTypes.oneOf([ASSIGNED, UNASSIGNED]),
  title: PropTypes.node.isRequired,
});

const notesShape = PropTypes.shape({
  items: PropTypes.arrayOf(noteShape),
  loading: PropTypes.bool,
  sortParams: PropTypes.shape({
    by: PropTypes.string,
    order: PropTypes.oneOf([ASC, DESC]),
  }),
  totalCount: PropTypes.number,
});

export default class NotesAssigningModal extends React.Component {
  static propTypes = {
    fetchDomainNotes: PropTypes.func.isRequired,
    notes: notesShape,
    noteTypes: PropTypes.arrayOf(PropTypes.string),
    onClose: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    onSort: PropTypes.func.isRequired,
    open: PropTypes.bool,
  };

  static defaultProps = {
    notes: {
      totalCount: 0,
      items: [],
      sortParams: {
        order: ASC,
        by: columnNames.TITLE,
      },
      loading: false,
    },
    open: false,
  };

  state = {
    selectedStatusFilters: [],
    selectedNoteTypeFilters: [],
    query: '',
    changedNoteIdToStatusMap: new Map(),
  };

  firstColumnHeaderFormatter = {
    [columnNames.ASSIGNING]: (note) => {
      return (
        <FormattedMessage id="stripes-smart-components.notes.assignUnassignNote">
          {ariaLabel => (
            <Checkbox
              disabled={this.isAssigningDisabled(note)}
              checked={note.status === ASSIGNED}
              onClick={() => this.onSingleAssignClick(note)}
              data-test-notes-modal-assignment-checkbox
              aria-label={ariaLabel}
            />
          )}
        </FormattedMessage>
      );
    },
  };

  isAssigningDisabledForAllNotes() {
    return this.props.notes.items.every((note) => {
      return this.isAssigningDisabled(note);
    });
  }

  isAssigningDisabled(note) {
    const isAssigned = note.status === ASSIGNED;
    return isAssigned && this.getNoteLinksNumber(note) === NOTE_LINKS_MIN_NUMBER;
  }

  getNoteLinksNumber(note) {
    const newStatus = this.state.changedNoteIdToStatusMap.get(note.id);
    return newStatus === ASSIGNED ? note.linksNumber + 1 : note.linksNumber;
  }

  onSingleAssignClick = (note) => {
    this.setState((state, props) => {
      return {
        changedNoteIdToStatusMap: this.getNewChangedNoteIdToStatusMap(state, note, props.notes.items),
      };
    });
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

  onStatusFilterChange = (filter) => {
    this.setState(
      { selectedStatusFilters: [...filter.values] },
      this.search
    );
  };

  onNoteTypeFiltersChange = (filter) => {
    this.setState(
      { selectedNoteTypeFilters: [...filter.values] },
      this.search
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

  renderFooter() {
    return (
      <div>
        <Button
          onClick={this.props.onClose}
          data-test-notes-modal-cancel-button
          marginBottom0
        >
          <FormattedMessage id="stripes-core.button.cancel" />
        </Button>
        <Button
          onClick={this.onSaveAndClose}
          buttonStyle="primary"
          marginBottom0
          data-test-notes-modal-save-button
        >
          <FormattedMessage id="stripes-core.button.save" />
        </Button>
      </div>
    );
  }

  onSaveAndClose = () => {
    this.props.onSave(this.state.changedNoteIdToStatusMap);
  }

  search = () => {
    const {
      query,
      selectedStatusFilters,
      selectedNoteTypeFilters,
    } = this.state;

    this.setState(
      { changedNoteIdToStatusMap: new Map() },
      this.props.onSearch({
        query,
        selectedStatusFilters,
        selectedNoteTypeFilters,
      })
    );
  }

  onSearchQueryChange = (event) => {
    const { value } = event.target;
    this.updateQuery(value);
  }

  updateQuery = debounce((value) => {
    this.setState({ query: value });
  }, DEBOUNCE_TIME_FOR_SETTING_QUERY);

  onResetAll = () => {
    this.setState({
      query: '',
      selectedStatusFilters: [],
      selectedNoteTypeFilters: [],
    }, this.props.onReset);
  }

  onColumnHeaderClick = (event, column) => {
    if (column.name === columnNames.ASSIGNING) return;

    const {
      query,
      selectedStatusFilters,
      selectedNoteTypeFilters,
    } = this.state;

    if (column.name === 'status' && selectedStatusFilters.length === 1) {
      return;
    }

    this.props.onSort({
      sortParams: this.getSortParams(column.name),
      query,
      selectedStatusFilters,
      selectedNoteTypeFilters,
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

  getColumnMapping = () => {
    return {
      [columnNames.ASSIGNING]: (
        <FormattedMessage id="stripes-smart-components.notes.assignUnassignAll">
          {ariaLabel => (
            <Checkbox
              name={columnNames.ASSIGNING}
              checked={this.isEveryNoteAssigned()}
              disabled={this.isAssigningDisabledForAllNotes()}
              onClick={this.onAssignAllClick}
              aria-label={ariaLabel}
            />
          )}
        </FormattedMessage>
      ),
      [columnNames.TITLE]: <FormattedMessage id="stripes-smart-components.title" />,
      [columnNames.STATUS]: <FormattedMessage id="stripes-smart-components.status" />,
      [columnNames.COUNT]: <FormattedMessage id="stripes-smart-components.notes.assigned.count" />
    };
  }

  isEveryNoteAssigned() {
    const { notes } = this.props;

    const incomingAssignedNotesMinusPotential = notes.items
      .filter((note) => note.status === ASSIGNED && !this.state.changedNoteIdToStatusMap.has(note.id));

    let potentialAssignedNotesCount = 0;

    for (const potentialStatus of this.state.changedNoteIdToStatusMap.values()) {
      if (potentialStatus === ASSIGNED) {
        potentialAssignedNotesCount++;
      }
    }

    return incomingAssignedNotesMinusPotential.length + potentialAssignedNotesCount === notes.items.length;
  }

  onAssignAllClick = (event) => {
    const { checked } = event.target;

    this.setState((state) => {
      const newStatus = checked ? ASSIGNED : UNASSIGNED;
      const newChangedNoteIdToStatusMap = new Map(state.changedNoteIdToStatusMap);

      this.props.notes.items.forEach((curIncomingNote) => {
        if (curIncomingNote.status !== newStatus) {
          if (newStatus === UNASSIGNED && this.getNoteLinksNumber(curIncomingNote) === NOTE_LINKS_MIN_NUMBER) {
            return;
          }
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

  renderResetFiltersButton(props) {
    return (
      <FormattedMessage id="stripes-smart-components.reset">
        {ariaLabel => (
          <IconButton
            size="small"
            iconSize="small"
            icon="times-circle-solid"
            aria-label={ariaLabel}
            {...props}
          />
        )}
      </FormattedMessage>
    );
  }

  onStatusFiltersReset = () => {
    this.setState({ selectedStatusFilters: [] });

    this.props.onSearch({ assignmentStatuses: [] });
  }

  onNoteTypeFiltersReset = () => {
    this.setState({ selectedNoteTypeFilters: [] });

    this.props.onSearch({ assignmentStatuses: [] });
  }

  fetchNotes = () => {
    const {
      query,
      selectedStatusFilters,
      selectedNoteTypeFilters,
    } = this.state;

    const {
      fetchDomainNotes,
      notes,
    } = this.props;

    const offset = get(this.props, 'notes.items.length');

    if (offset === notes.totalCount) {
      return;
    }

    fetchDomainNotes({
      offset,
      query,
      selectedStatusFilters,
      selectedNoteTypeFilters,
    });
  }

  getNotesStatusOptions() {
    return notesStatusOptions.map((option) => {
      return {
        ...option,
        disabled: this.props.notes.loading,
      };
    });
  }

  getNoteTypeOptions() {
    return this.props.noteTypes.map(noteTypeName => {
      return {
        label: noteTypeName,
        value: noteTypeName,
      };
    });
  }

  render() {
    const {
      open,
      notes,
      onClose,
    } = this.props;

    const {
      query,
      selectedStatusFilters,
      selectedNoteTypeFilters,
    } = this.state;

    const queryIsEmpty = query.length === 0;
    const statusFiltersAreEmpty = selectedStatusFilters.length === 0;
    const noteTypeFiltersAreEmpty = selectedNoteTypeFilters.length === 0;
    const searchOptionsIsEmpty = queryIsEmpty && statusFiltersAreEmpty && noteTypeFiltersAreEmpty;
    const thereAreSelectedStatusFilters = selectedStatusFilters.length > 0;
    const thereAreSelectedNoteTypeFilters = selectedNoteTypeFilters.length > 0;

    return (
      <Modal
        size="large"
        contentClass={css['modal-content']}
        open={open}
        label={<FormattedMessage id="stripes-smart-components.notes.assignUnassignNote" />}
        onClose={onClose}
        footer={this.renderFooter()}
        dismissible
        data-test-notes-modal
      >
        <div className={css['notes-paneset-container']}>
          <Paneset id="notes-modal-paneset" static isRoot>
            <Pane
              defaultWidth="30%"
              paneTitle={<FormattedMessage id="stripes-smart-components.searchAndFilter" />}
            >
              <FormattedMessage id="stripes-smart-components.notes.noteSearch">
                {ariaLabel => (
                  <SearchField
                    name="query"
                    onChange={this.onSearchQueryChange}
                    value={query}
                    autoFocus
                    data-test-notes-modal-search-field
                    ariaLabel={ariaLabel}
                  />
                )}
              </FormattedMessage>
              <Button
                type="submit"
                buttonStyle="primary"
                fullWidth
                disabled={queryIsEmpty || notes.loading}
                onClick={this.search}
                data-test-notes-modal-search-button
              >
                <FormattedMessage id="stripes-smart-components.search" />
              </Button>

              <div>
                <ResetButton
                  label={<FormattedMessage id="stripes-smart-components.resetAll" />}
                  disabled={searchOptionsIsEmpty}
                  onClick={this.onResetAll}
                  data-test-notes-modal-reset-all-button
                />
              </div>
              <AccordionSet>
                <Accordion
                  id="noteTypes"
                  closedByDefault={false}
                  label={
                    <Headline size="large" tag="h3">
                      <FormattedMessage id="stripes-smart-components.noteType" />
                    </Headline>
                  }
                  displayWhenOpen={
                    thereAreSelectedNoteTypeFilters
                      ? this.renderResetFiltersButton({ onClick: this.onNoteTypeFiltersReset })
                      : null
                  }
                >
                  <FormattedMessage id="stripes-smart-components.noteType">
                    {ariaLabel => (
                      <MultiSelectionFilter
                        id="noteTypeSelect"
                        name="noteTypes"
                        selectedValues={selectedNoteTypeFilters}
                        dataOptions={this.getNoteTypeOptions()}
                        onChange={this.onNoteTypeFiltersChange}
                        disabled={this.props.notes.loading}
                        aria-label={ariaLabel}
                      />
                    )}
                  </FormattedMessage>
                </Accordion>

                <Accordion
                  id="notes-status"
                  closedByDefault={false}
                  label={
                    <Headline size="large" tag="h3">
                      <FormattedMessage id="stripes-smart-components.notes.noteAssignmentStatus" />
                    </Headline>
                  }
                  displayWhenOpen={
                    thereAreSelectedStatusFilters
                      ? this.renderResetFiltersButton({ onClick: this.onStatusFiltersReset })
                      : null
                  }
                >
                  <CheckboxFilter
                    dataOptions={this.getNotesStatusOptions()}
                    name="notesStatus"
                    selectedValues={selectedStatusFilters}
                    onChange={this.onStatusFilterChange}
                  />
                </Accordion>
              </AccordionSet>
            </Pane>
            <Pane
              paneTitle={<FormattedMessage id="stripes-smart-components.notes" />}
              paneSub={(
                <FormattedMessage
                  id="stripes-smart-components.notes.found"
                  values={{ quantity: notes.totalCount || 0 }}
                />
              )}
              defaultWidth="70%"
              noOverflow
              padContent={false}
            >
              <Layout className={`${css['results-outer']} display-flex flex-direction-column full`}>
                {notes.totalCount > 0 && (
                  <p className={css['caution-message']}>
                    <FormattedMessage id="stripes-smart-components.notes.cautionMessage" />
                  </p>
                )}
                <div className={css['results-outer']}>
                  <MultiColumnList
                    visibleColumns={[columnNames.ASSIGNING, columnNames.TITLE, columnNames.STATUS, columnNames.COUNT]}
                    contentData={this.getNotes()}
                    totalCount={notes.totalCount}
                    columnMapping={this.getColumnMapping()}
                    columnWidths={columnWidths}
                    onHeaderClick={this.onColumnHeaderClick}
                    sortOrder={notes.sortParams.by}
                    sortDirection={sortOrderToDirectionMap.get(notes.sortParams.order)}
                    isEmptyMessage={<FormattedMessage id="stripes-smart-components.notes.notFound" />}
                    formatter={this.firstColumnHeaderFormatter}
                    virtualize
                    autosize
                    onNeedMoreData={this.fetchNotes}
                    loading={notes.loading}
                    id="notes-modal-notes-list"
                  />
                </div>
              </Layout>
            </Pane>
          </Paneset>
        </div>
      </Modal>
    );
  }
}

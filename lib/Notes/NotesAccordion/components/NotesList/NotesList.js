import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
} from 'react-intl';

import { MultiColumnList } from '@folio/stripes-components';
import {
  noteShape,
  columnShape,
} from '../../NotesAccordion';

export default class NotesList extends React.Component {
  static propTypes = {
    columnsConfig: PropTypes.arrayOf(columnShape).isRequired,
    notes: PropTypes.arrayOf(noteShape).isRequired,
    onNoteClick: PropTypes.func.isRequired,
  }

  getItems() {
    return this.props.notes
      .map(note => {
        const {
          id,
          title,
          lastSavedDate,
          lastSavedUserFullName,
        } = note;

        return {
          id,
          date: (
            <FormattedDate
              value={lastSavedDate}
              year="numeric"
              month="numeric"
              day="numeric"
            />
          ),
          updatedBy: lastSavedUserFullName,
          title,
        };
      });
  }

  getColumnNames() {
    return this.props.columnsConfig.map(({ name }) => name);
  }

  getColumnTitlesMap() {
    return this.props.columnsConfig.reduce((columnsMap, { name, title }) => {
      columnsMap[name] = title;
      return columnsMap;
    });
  }

  getColumnWidths() {
    return this.props.columnsConfig.map(({ name, width }) => ({ [name]: width }));
  }

  onRowClickHandler = (event, note) => {
    this.props.onNoteClick(note.id);
  }

  render() {
    return (
      <FormattedMessage id="stripes-smart-components.notes">
        {
          (ariaLabel) => (
            <MultiColumnList
              id="notes-list"
              data-test-notes-accordion-list
              interactive
              ariaLabel={ariaLabel}
              contentData={this.getItems()}
              visibleColumns={this.getColumnNames()}
              columnMapping={this.getColumnTitlesMap()}
              columnWidths={this.getColumnWidths()}
              isEmptyMessage={<FormattedMessage id="stripes-smart-components.notes.notFound" />}
              onRowClick={this.onRowClickHandler}
            />
          )
        }
      </FormattedMessage>
    );
  }
}

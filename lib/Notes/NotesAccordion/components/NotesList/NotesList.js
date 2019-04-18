import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
} from 'react-intl';
import memoize from 'memoize-one';

import { MultiColumnList } from '@folio/stripes-components';
import {
  noteShape,
  columnShape,
} from '../../NotesAccordion';

export default class NotesList extends React.Component {
  static propTypes = {
    columnsConfig: PropTypes.arrayOf(columnShape),
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

  getColumnNames = memoize((config) => {
    return config.map(({ name }) => name);
  });

  getColumnTitlesMap = memoize((config) => {
    return config.map(({ name, title }) => ({ [name]: title }));
  });

  getColumnsWidths = memoize((config) => {
    return config.map(({ name, width }) => ({ [name]: width }));
  });

  onRowClickHandler = (event, note) => {
    this.props.onNoteClick(note.id);
  }

  render() {
    const {
      columnsConfig,
    } = this.props;

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
              visibleColumns={this.getColumnNames(columnsConfig)}
              columnMapping={this.getColumnTitlesMap(columnsConfig)}
              columnWidths={this.getColumnWidths(columnsConfig)}
              isEmptyMessage={<FormattedMessage id="stripes-smart-components.notes.notFound" />}
              onRowClick={this.onRowClickHandler}
            />
          )
        }
      </FormattedMessage>
    );
  }
}

import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
} from 'react-intl';

import { MultiColumnList } from '@folio/stripes-components';

import {
  notesStatuses,
} from '../../constants';

const defaultColumnsConfig = [
  {
    name: 'date',
    title: <FormattedMessage id="stripes-smart-components.date" />,
    width: '30%',
  },
  {
    name: 'updatedBy',
    title: <FormattedMessage id="stripes-smart-components.updatedBy" />,
    width: '30%',
  },
  {
    name: 'title',
    title: <FormattedMessage id="stripes-smart-components.title" />,
    width: '40%',
  },
];

const {
  ASSIGNED,
  UNASSIGNED,
} = notesStatuses;

const noteShape = PropTypes.shape({
  id: PropTypes.string,
  lastSavedDate: PropTypes.instanceOf(Date),
  lastSavedUserFullName: PropTypes.string,
  title: PropTypes.string,
});

const columnsConfigShape = PropTypes.shape({
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    status: PropTypes.oneOf([ASSIGNED, UNASSIGNED]),
    title: PropTypes.string,
  })),
  totalCount: PropTypes.number,
});

export default class NotesList extends React.Component {
  static propTypes = {
    columnsConfig: PropTypes.arrayOf(columnsConfigShape),
    notes: PropTypes.shape({
      items: PropTypes.arrayOf(noteShape),
      loading: PropTypes.bool,
    }),
    onNoteClick: PropTypes.func.isRequired,
  }

  static defaultProps = {
    columnsConfig: defaultColumnsConfig,
    notes: {
      items: [],
      loading: false,
    },
  }

  getItems() {
    return this.props.notes.items
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
    return this.props.columnsConfig
      .reduce((columnsMap, { name, title }) => {
        columnsMap[name] = title;
        return columnsMap;
      }, {});
  }

  getColumnWidths() {
    return this.props.columnsConfig
      .reduce((columnsWidths, { name, width }) => {
        columnsWidths[name] = width;
        return columnsWidths;
      }, {});
  }

  onRowClick= (event, note) => {
    this.props.onNoteClick(note.id);
  }

  render() {
    return (
      <FormattedMessage id="stripes-smart-components.notes">
        {
          (ariaLabel) => (
            <MultiColumnList
              id="notes-list"
              interactive
              ariaLabel={ariaLabel}
              contentData={this.getItems()}
              visibleColumns={this.getColumnNames()}
              columnMapping={this.getColumnTitlesMap()}
              columnWidths={this.getColumnWidths()}
              isEmptyMessage={<FormattedMessage id="stripes-smart-components.notes.notFound" />}
              onRowClick={this.onRowClick}
              loading={this.props.notes.loading}
            />
          )
        }
      </FormattedMessage>
    );
  }
}

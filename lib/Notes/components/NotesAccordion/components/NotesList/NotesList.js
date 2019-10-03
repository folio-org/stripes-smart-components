import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
} from 'react-intl';

import { MultiColumnList } from '@folio/stripes-components';

const defaultColumnsConfig = [
  {
    name: 'date',
    title: <FormattedMessage id="stripes-smart-components.date" />,
    width: '20%',
  },
  {
    name: 'title',
    title: <FormattedMessage id="stripes-smart-components.title" />,
    width: '40%',
  },
  {
    name: 'type',
    title: <FormattedMessage id="stripes-smart-components.type" />,
    width: '40%',
  },
];

const noteShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  lastSavedDate: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
});

const columnsConfigShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  width: PropTypes.string.isRequired,
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
          type,
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
          title,
          type
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

  render() {
    const {
      notes,
      onNoteClick,
    } = this.props;

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
              loading={notes.loading}
              onRowClick={onNoteClick}
            />
          )
        }
      </FormattedMessage>
    );
  }
}

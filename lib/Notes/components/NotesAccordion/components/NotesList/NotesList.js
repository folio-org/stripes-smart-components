import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
} from 'react-intl';
import { isUndefined } from 'lodash';
import classnames from 'classnames';

import { MultiColumnList } from '@folio/stripes-components';

import { DETAILS_CUTOFF_LENGTH } from '../../../../constants';

import css from './NotesList.css';

const defaultColumnsConfig = [
  {
    name: 'date',
    title: <FormattedMessage id="stripes-smart-components.date" />,
    width: '20%',
  },
  {
    name: 'titleAndDetails',
    title: <FormattedMessage id="stripes-smart-components.notes.titleAndDetails" />,
    width: '60%',
  },
  {
    name: 'type',
    title: <FormattedMessage id="stripes-smart-components.type" />,
    width: '20%',
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
  titleAndDetails: PropTypes.node.isRequired,
  width: PropTypes.string,
});

export default class NotesList extends React.Component {
  static propTypes = {
    columnsConfig: PropTypes.arrayOf(columnsConfigShape),
    notes: PropTypes.shape({
      items: PropTypes.arrayOf(noteShape),
      loading: PropTypes.bool,
    }),
    onNoteClick: PropTypes.func.isRequired,
    onNoteEditClick: PropTypes.func.isRequired,
  }

  static defaultProps = {
    columnsConfig: defaultColumnsConfig,
    notes: {
      items: [],
      loading: false,
    },
  }

  state = { isDetailsExpanded: false };

  handleShowMoreClick = (e) => {
    e.stopPropagation();

    this.setState(({ isDetailsExpanded }) => ({
      isDetailsExpanded: !isDetailsExpanded,
    }));
  }

  handleEditClick = (e, note) => {
    e.stopPropagation();

    this.props.onNoteEditClick(e, note);
  }

  renderShowMoreButton() {
    const { isDetailsExpanded } = this.state;

    return (
      <button
        type="button"
        className={classnames([css.NoteDetailsButton, css.NoteDetailsShowMoreButton])}
        onClick={this.handleShowMoreClick}
        data-test-note-show-more-button
      >
        {isDetailsExpanded
          ? <FormattedMessage id="stripes-smart-components.notes.showLessDetails" />
          : <FormattedMessage id="stripes-smart-components.notes.showMoreDetails" />
        }
      </button>
    );
  }

  renderEditButton(note) {
    return (
      <button
        type="button"
        className={css.NoteDetailsButton}
        onClick={(e) => this.handleEditClick(e, note)}
        data-test-note-edit-button
      >
        <FormattedMessage id="stripes-components.button.edit" />
      </button>
    );
  }

  getItems() {
    const { isDetailsExpanded } = this.state;


    return this.props.notes.items
      .map(note => {
        const {
          id,
          title,
          content,
          lastSavedDate,
          type,
        } = note;

        const titleContent = title && (
          <div>
            <strong><FormattedMessage id="stripes-smart-components.title" />: </strong>
            {title}
          </div>
        );

        const htmlString = isDetailsExpanded
          ? content
          : content.substring(0, DETAILS_CUTOFF_LENGTH);

        const detailsContent = content && (
          <div>
            <strong><FormattedMessage id="stripes-smart-components.details" />: </strong>
            {/* eslint-disable-next-line react/no-danger */}
            <span data-test-note-details dangerouslySetInnerHTML={{ __html: htmlString }} />
          </div>
        );

        return {
          id,
          date: (
            <div>
              <FormattedDate
                value={lastSavedDate}
                year="numeric"
                month="numeric"
                day="numeric"
              />
            </div>
          ),
          titleAndDetails: (
            <div>
              {titleContent}
              {detailsContent}
              <div>
                {content.length > DETAILS_CUTOFF_LENGTH && this.renderShowMoreButton()}
                {this.renderEditButton(note)}
              </div>
            </div>
          ),
          type: (
            <span>{type}</span>
          ),
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

  /* eslint-disable consistent-return */
  getColumnWidths() {
    if (this.props.columnsConfig.every(column => isUndefined(column.width))) return;

    return this.props.columnsConfig
      .reduce((columnsWidths, { name, width }) => {
        if (width) { columnsWidths[name] = width; }

        return columnsWidths;
      }, {});
  }
  /* eslint-enable consistent-return */

  getCellClass(mclCellStyle) {
    return classnames([css.NotesListMCLCell, mclCellStyle]);
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
              getCellClass={this.getCellClass}
            />
          )
        }
      </FormattedMessage>
    );
  }
}

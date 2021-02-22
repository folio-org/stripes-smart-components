import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
  injectIntl,
} from 'react-intl';
import classnames from 'classnames';

import { MultiColumnList } from '@folio/stripes-components';

import { IfPermission } from '@folio/stripes-core';
import {
  DETAILS_CUTOFF_LENGTH,
  notesColumnNames,
  notesColumnsWidth,
} from '../../../../constants';
import {
  getHTMLSubstring,
  getStringLength,
} from '../../../../utils';

import css from './NotesList.css';

const noteShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  lastSavedDate: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
});

class NotesList extends React.Component {
  static propTypes = {
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    notes: PropTypes.shape({
      items: PropTypes.arrayOf(noteShape),
      loading: PropTypes.bool,
    }),
    onHeaderClick: PropTypes.func.isRequired,
    onNoteClick: PropTypes.func.isRequired,
    onNoteEditClick: PropTypes.func.isRequired,
    sortDirection: PropTypes.oneOf(['ascending', 'descending']),
    sortedColumn: PropTypes.oneOf(Object.values(notesColumnNames)),
  }

  static defaultProps = {
    notes: {
      items: [],
      loading: false,
    },
  }

  state = { isDetailsExpanded: {} };

  handleShowMoreClick = id => e => {
    e.stopPropagation();

    this.setState(({ isDetailsExpanded }) => ({
      isDetailsExpanded: {
        ...isDetailsExpanded,
        [id]: !isDetailsExpanded[id],
      },
    }));
  }

  handleEditClick = (e, note) => {
    e.stopPropagation();

    this.props.onNoteEditClick(e, note);
  }

  renderShowMoreButton(id) {
    const { isDetailsExpanded } = this.state;

    return (
      <button
        type="button"
        className={classnames([css.NoteDetailsButton, css.NoteDetailsShowMoreButton])}
        onClick={this.handleShowMoreClick(id)}
        data-test-note-show-more-button
      >
        {isDetailsExpanded[id]
          ? <FormattedMessage id="stripes-smart-components.notes.showLessDetails" />
          : <FormattedMessage id="stripes-smart-components.notes.showMoreDetails" />
        }
      </button>
    );
  }

  renderEditButton(note) {
    return (
      <IfPermission perm="ui-notes.item.edit">
        <button
          type="button"
          className={css.NoteDetailsButton}
          onClick={(e) => this.handleEditClick(e, note)}
          data-test-note-edit-button
        >
          <FormattedMessage id="stripes-components.button.edit" />
        </button>
      </IfPermission>
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
          <div data-test-note-title>
            <strong><FormattedMessage id="stripes-smart-components.title" />: </strong>
            {title}
          </div>
        );

        const htmlString = isDetailsExpanded[id]
          ? content
          : getHTMLSubstring(content, DETAILS_CUTOFF_LENGTH);

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
            <div data-test-note-date>
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
                {getStringLength(content) > DETAILS_CUTOFF_LENGTH && this.renderShowMoreButton(id)}
                {this.renderEditButton(note)}
              </div>
            </div>
          ),
          type: (
            <span data-test-note-type>{type}</span>
          ),
        };
      });
  }

  /* eslint-enable consistent-return */

  getCellClass(mclCellStyle) {
    return classnames([css.NotesListMCLCell, mclCellStyle]);
  }

  render() {
    const {
      notes,
      onNoteClick,
      onHeaderClick,
      sortedColumn,
      sortDirection,
      intl: { formatMessage },
    } = this.props;

    const columnMapping = {
      [notesColumnNames.DATE]: formatMessage({ id: 'stripes-smart-components.date' }),
      [notesColumnNames.TITLE_AND_DETAILS]: (
        formatMessage({ id: 'stripes-smart-components.notes.titleAndDetails' })
      ),
      [notesColumnNames.TYPE]: formatMessage({ id: 'stripes-smart-components.type' }),
    };

    return (
      <FormattedMessage id="stripes-smart-components.notes">
        {
          ([ariaLabel]) => (
            <MultiColumnList
              id="notes-list"
              interactive
              ariaLabel={ariaLabel}
              contentData={this.getItems()}
              visibleColumns={Object.values(notesColumnNames)}
              columnMapping={columnMapping}
              columnWidths={notesColumnsWidth}
              isEmptyMessage={<FormattedMessage id="stripes-smart-components.notes.notFound" />}
              loading={notes.loading}
              onRowClick={onNoteClick}
              getCellClass={this.getCellClass}
              onHeaderClick={onHeaderClick}
              sortedColumn={sortedColumn}
              sortDirection={sortDirection}
            />
          )
        }
      </FormattedMessage>
    );
  }
}

export default injectIntl(NotesList);

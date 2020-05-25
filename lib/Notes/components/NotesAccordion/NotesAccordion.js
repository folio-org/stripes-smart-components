/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import { IfPermission } from '@folio/stripes-core';
import {
  Accordion,
  Headline,
  Badge,
  Button,
} from '@folio/stripes-components';

import NotesList from './components/NotesList';
import NotesAssigningModal from './components/NotesAssigningModal';

import styles from './NotesAccordion.css';

export default class NotesAccordion extends Component {
  static propTypes = {
    hideAssignButton: PropTypes.bool,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onAssignedNoteClick: PropTypes.func.isRequired,
    onNoteCreateButtonClick: PropTypes.func.isRequired,
    onResetSearchResults: PropTypes.func.isRequired,
    onSaveAssigningResults: PropTypes.func.isRequired,
    onToggle: PropTypes.func,
    open: PropTypes.bool,
  };

  static defaultProps = {
    hideAssignButton: false,
  };

  state = { modalIsOpen: false };

  onCloseModal = () => {
    this.props.onResetSearchResults();
    this.setState({
      modalIsOpen: false,
    });
  };

  onSaveAssigningResults = (changedNoteIdToStatusMap) => {
    this.props.onSaveAssigningResults(changedNoteIdToStatusMap);
    this.onCloseModal();
  }

  renderHeader = () => {
    return (
      <Headline size="large" tag="h3">
        <FormattedMessage id="stripes-smart-components.notes" />
      </Headline>
    );
  };

  renderHeaderButtons() {
    const { hideAssignButton } = this.props;

    return (
      <>
        {!hideAssignButton && (
          <IfPermission perm="ui-notes.item.assign-unassign">
            <Button
              onClick={this.onAssignButtonClick}
              data-test-notes-accordion-assign-button
            >
              <FormattedMessage id="stripes-smart-components.assignUnassign" />
            </Button>
          </IfPermission>
        )}
        <IfPermission perm="ui-notes.item.create">
          <Button
            buttonClass={styles['new-button']}
            onClick={this.props.onNoteCreateButtonClick}
            data-test-notes-accordion-new-button
          >
            <FormattedMessage id="stripes-smart-components.new" />
          </Button>
        </IfPermission>
      </>
    );
  }

  onAssignButtonClick = () => {
    this.setState({ modalIsOpen: true });
  };

  renderQuantityIndicator() {
    return (
      <Badge>
        <span data-test-notes-accordion-quantity-indicator>
          { get(this.props, 'assignedNotes.items.length') }
        </span>
      </Badge>
    );
  }

  renderAssigningModal() {
    const {
      domainNotes,
      noteTypes,
      onResetSearchResults,
      onSearch,
      onSortDomainNotes,
      fetchDomainNotes,
    } = this.props;

    return (
      <NotesAssigningModal
        open
        fetchDomainNotes={fetchDomainNotes}
        notes={domainNotes}
        noteTypes={noteTypes}
        onClose={this.onCloseModal}
        onReset={onResetSearchResults}
        onSave={this.onSaveAssigningResults}
        onSearch={onSearch}
        onSort={onSortDomainNotes}
      />
    );
  }

  render() {
    const {
      columnsConfig,
      id,
      open,
      assignedNotes,
      noteTypes,
      onAssignedNoteClick,
      onToggle,
    } = this.props;

    const {
      modalIsOpen,
    } = this.state;

    return (
      <>
        <Accordion
          id={id}
          open={open}
          label={this.renderHeader()}
          displayWhenClosed={this.renderQuantityIndicator()}
          displayWhenOpen={this.renderHeaderButtons()}
          onToggle={onToggle}
        >
          <NotesList
            columnsConfig={columnsConfig}
            notes={assignedNotes}
            noteTypes={noteTypes}
            onNoteClick={onAssignedNoteClick}
          />
        </Accordion>

        { modalIsOpen && this.renderAssigningModal() }
      </>
    );
  }
}

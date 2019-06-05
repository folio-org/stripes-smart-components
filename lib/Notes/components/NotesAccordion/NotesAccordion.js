/* eslint-disable react/prop-types */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

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
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onAssignedNoteClick: PropTypes.func.isRequired,
    onNoteCreateButtonClick: PropTypes.func.isRequired,
    onResetSearchResults: PropTypes.func.isRequired,
    onSaveAssigningResults: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    open: PropTypes.bool,
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
    return (
      <Fragment>
        <Button
          onClick={this.onAssignButtonClick}
          data-test-notes-accordion-assign-button
        >
          <FormattedMessage id="stripes-smart-components.assign" />
        </Button>
        <Button
          buttonClass={styles['new-button']}
          onClick={this.props.onNoteCreateButtonClick}
          data-test-notes-accordion-new-button
        >
          <FormattedMessage id="stripes-smart-components.new" />
        </Button>
      </Fragment>
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
      onAssignedNoteClick,
      onToggle,
    } = this.props;

    const {
      modalIsOpen,
    } = this.state;

    return (
      <Fragment>
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
            onNoteClick={onAssignedNoteClick}
          />
        </Accordion>

        { modalIsOpen && this.renderAssigningModal() }
      </Fragment>
    );
  }
}

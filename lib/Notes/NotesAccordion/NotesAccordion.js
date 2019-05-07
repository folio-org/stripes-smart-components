/* eslint-disable react/prop-types */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Accordion, Headline, Badge, Button } from '@folio/stripes-components';

import NotesList from './components/NotesList';
import NotesAssigningModal from './components/NotesAssigningModal';

import styles from './NotesAccordion.css';

export default class NotesAccordion extends Component {
  static propTypes = {
    onCreate: PropTypes.func.isRequired,
    onSaveAssigningResults: PropTypes.func.isRequired,
    open: PropTypes.bool,
  };

  state = { modalIsOpen: false };

  onCloseModalHandler = () => {
    this.setState(() => {
      return {
        modalIsOpen: false,
      };
    });
  };

  onSaveAssigningResultsHandler = (changedNoteIdToStatusMap) => {
    this.props.onSaveAssigningResults(changedNoteIdToStatusMap);
    this.onCloseModalHandler();
  }

  renderHeader = () => {
    return (
      <Headline size="large" tag="h3">
        <FormattedMessage id="stripes-smart-components.notes" />
      </Headline>
    );
  };

  renderHeaderButtons() {
    const { onCreate } = this.props;

    return (
      <Fragment>
        <Button onClick={this.onAssignButtonClickHandler}>
          <FormattedMessage id="stripes-smart-components.assign" />
        </Button>
        <Button buttonClass={styles['new-button']} onClick={onCreate}>
          <FormattedMessage id="stripes-smart-components.new" />
        </Button>
      </Fragment>
    );
  }

  onAssignButtonClickHandler = () => {
    this.setState((state) => {
      return { modalIsOpen: !state.modalIsOpen };
    });
  };

  renderQuantityIndicator() {
    return (
      <Badge>
        <span>
          {this.props.assignedNotes.items.length}
        </span>
      </Badge>
    );
  }

  render() {
    const {
      columnsConfig,
      open,
      assignedNotes,
      domainNotes,
      onNoteClick,
      onResetSearchResults,
      onSearch,
      onSortDomainNotes,
      onNeedMoreDomainNotes,
    } = this.props;

    return (
      <Fragment>
        <Accordion
          id="notes-accordion"
          open={open}
          label={this.renderHeader()}
          displayWhenClosed={this.renderQuantityIndicator()}
          displayWhenOpen={this.renderHeaderButtons()}
        >
          <NotesList
            columnsConfig={columnsConfig}
            notes={assignedNotes}
            onNoteClick={onNoteClick}
          />
        </Accordion>

        <NotesAssigningModal
          open={this.state.modalIsOpen}
          onReset={onResetSearchResults}
          onSave={this.onSaveAssigningResultsHandler}
          onSearch={onSearch}
          onClose={this.onCloseModalHandler}
          onSort={onSortDomainNotes}
          onNeedMore={onNeedMoreDomainNotes}
          notes={domainNotes}
        />
      </Fragment>
    );
  }
}

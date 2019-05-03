import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Form } from 'react-final-form';

import { AppIcon } from '@folio/stripes-core';

import {
  Accordion,
  ExpandAllButton,
  Pane,
  Paneset,
  Row,
  Col,
  MetaSection,
  Icon,
  IconButton,
  Button,
} from '@folio/stripes-components';

import NavigationModal from '../NavigationModal';

import NoteFields from '../NoteFields';
import AssignmentsList from '../AssignmentsList';

import styles from './NoteForm.css';

const maxTitleLength = 75;
const maxDetailsLength = 1500;

const invalidCharacters = ['@', '<', '>', '/'];

export default class NoteForm extends Component {
  static propTypes = {
    entityTypeTranslations: PropTypes.objectOf(PropTypes.string),
    linkedRecords: PropTypes.arrayOf(PropTypes.shape({
      count: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    })),
    noteData: PropTypes.shape({
      content: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
    noteMetadata: PropTypes.shape({
      createdBy: PropTypes.string,
      createdDate: PropTypes.string,
      lastUpdatedBy: PropTypes.string,
      lastUpdatedDate: PropTypes.string,
    }),
    noteTypes: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })).isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    referredRecord: PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
  };

  state = {
    sections: {
      noteForm: true,
      assigned: true,
    }
  };

  detailsEditorRef = React.createRef();

  handleSectionToggle = ({ id }) => {
    this.setState(prevState => ({
      sections: {
        ...prevState.sections,
        [id]: !prevState.sections[id],
      }
    }));
  }

  handleToggleAll = (toggledSections) => {
    this.setState({
      sections: toggledSections,
    });
  }

  renderExpandAllButton = () => {
    return (
      <ExpandAllButton
        accordionStatus={this.state.sections}
        onToggle={this.handleToggleAll}
      />
    );
  }

  renderNoteMetadata = () => {
    const { noteMetadata } = this.props;

    return (
      <Row>
        <Col xs={12}>
          <MetaSection {...noteMetadata} />
        </Col>
      </Row>
    );
  }

  renderFirstMenu = () => {
    const { onCancel } = this.props;

    return (
      <IconButton
        icon="times"
        onClick={onCancel}
      />
    );
  }

  renderLastMenu = (formIsPristine) => {
    return (
      <Button
        type="submit"
        buttonStyle="primary"
        marginBottom0
        disabled={formIsPristine}
      >
        <FormattedMessage id="stripes-smart-components.notes.saveAndClose" />
      </Button>
    );
  }

  getActionMenu = ({ onToggle }) => {
    const { onCancel } = this.props;

    return (
      <Fragment>
        <Button
          buttonStyle="dropdownItem"
          onClick={() => {
            onCancel();
            onToggle();
          }}
        >
          <Icon icon="times-circle">
            <FormattedMessage id="stripes-smart-components.notes.cancel" />
          </Icon>
        </Button>
      </Fragment>
    );
  };

  validateFormFields = (values) => {
    const { title } = values;
    const errors = {};

    if (this.detailsEditorRef.current) {
      const detailsPlainText = this.detailsEditorRef.current.getEditor().getText();

      errors.content = this.getDetailsValidationError(detailsPlainText);
    }

    errors.title = this.getTitleValidationError(title);

    return errors;
  }

  getDetailsValidationError = (details) => {
    if (details.length > maxDetailsLength) {
      return this.renderCharacterLimitExceededError('details');
    }

    if (this.hasInvalidCharacters(details)) {
      return this.renderInvalidCharacterError('details');
    }

    return null;
  }

  getTitleValidationError(title) {
    if (!title) {
      return <FormattedMessage id="stripes-smart-components.notes.title.missing" />;
    }

    if (title.length > maxTitleLength) {
      return this.renderCharacterLimitExceededError('title');
    }

    if (this.hasInvalidCharacters(title)) {
      return this.renderInvalidCharacterError('title');
    }

    return null;
  }

  renderInvalidCharacterError(fieldName) {
    return (
      <FormattedMessage
        id={`stripes-smart-components.notes.${fieldName}.invalidCharacter`}
        values={
          { characters: invalidCharacters.join(', ') }
        }
      />
    );
  }

  renderCharacterLimitExceededError = (fieldName) => {
    return <FormattedMessage id={`stripes-smart-components.notes.${fieldName}.lengthLimitExceeded`} />;
  }

  hasInvalidCharacters = (string) => {
    for (const character of invalidCharacters) {
      if (string.indexOf(character) !== -1) {
        return true;
      }
    }
    return false;
  }

  render() {
    const {
      onSubmit,
      noteTypes,
      referredRecord,
      noteData,
      linkedRecords,
      entityTypeTranslations,
      paneHeaderAppIcon,
      submitSucceeded,
    } = this.props;

    const {
      noteForm,
      assigned,
    } = this.state.sections;

    const isEditForm = !!noteData;

    const paneTitle = isEditForm
      ? (
        <FormattedMessage
          id="stripes-smart-components.notes.editNote"
          values={{ noteTitle: noteData.title }}
        />
      )
      : <FormattedMessage id="stripes-smart-components.notes.newNote" />;

    const paneTitleAppIcon = <AppIcon app={paneHeaderAppIcon} size="small" />;
    const noteTypeInitialValue = isEditForm
      ? noteData.type
      : noteTypes[0].value;

    const initialValues = {
      ...noteData,
      type: noteTypeInitialValue,
    };

    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validateFormFields}
      >
        {({ handleSubmit, pristine }) => (
          <form onSubmit={handleSubmit}>
            <Paneset>
              <Pane
                paneTitle={paneTitle}
                appIcon={paneTitleAppIcon}
                actionMenu={this.getActionMenu}
                firstMenu={this.renderFirstMenu()}
                lastMenu={this.renderLastMenu(pristine)}
                padContent={false}
                defaultWidth="100%"
              >
                <Paneset>
                  <Pane
                    lastMenu={this.renderExpandAllButton()}
                    defaultWidth="50%"
                    className={styles['note-form-content']}
                  >
                    <Accordion
                      label={<FormattedMessage id="stripes-smart-components.notes.generalInformation" />}
                      id="noteForm"
                      open={noteForm}
                      onToggle={this.handleSectionToggle}
                      separator={false}
                    >
                      {isEditForm && this.renderNoteMetadata()}
                      <NoteFields
                        detailsEditorRef={this.detailsEditorRef}
                        noteTypes={noteTypes}
                      />
                    </Accordion>
                    <Accordion
                      onToggle={this.handleSectionToggle}
                      label={<FormattedMessage id="stripes-smart-components.notes.assigned" />}
                      id="assigned"
                      open={assigned}
                    >
                      <AssignmentsList
                        referredRecord={referredRecord}
                        linkedRecords={linkedRecords}
                        entityTypeTranslations={entityTypeTranslations}
                      />
                    </Accordion>
                  </Pane>
                </Paneset>
              </Pane>
            </Paneset>
            <NavigationModal when={!pristine && !submitSucceeded} />
          </form>
        )}
      </Form>
    );
  }
}

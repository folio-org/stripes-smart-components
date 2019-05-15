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

import NoteFields from './components/NoteFields';
import NavigationModal from '../NavigationModal';
import AssignmentsList from '../AssignmentsList';

import styles from './NoteForm.css';

import {
  linkedEntitiesTypesShape,
  noteDataShape,
  noteTypesShape,
  referredEntityDataShape,
} from './noteShapes';

import {
  MAX_TITLE_LENGTH,
  MAX_DETAILS_LENGTH,
} from '../constants';

export default class NoteForm extends Component {
  static propTypes = {
    entityTypePluralizedTranslationKeyMap: PropTypes.objectOf(PropTypes.string),
    entityTypeTranslationKeyMap: PropTypes.objectOf(PropTypes.string),
    linkedEntitiesTypes: linkedEntitiesTypesShape,
    noteData: noteDataShape,
    noteMetadata: PropTypes.shape({
      createdBy: PropTypes.string,
      createdDate: PropTypes.string,
      lastUpdatedBy: PropTypes.string,
      lastUpdatedDate: PropTypes.string,
    }),
    noteTypes: noteTypesShape.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    referredEntityData: referredEntityDataShape.isRequired,
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

    return this.isEditForm() && (
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

  isEditForm = () => {
    return !!this.props.noteData;
  }

  validateFormFields = (values) => {
    const { title } = values;
    const errors = {};

    if (this.detailsEditorRef.current) {
      const detailsPlainText = this.detailsEditorRef.current.getEditor().getText();

      if (detailsPlainText.length > MAX_DETAILS_LENGTH) {
        errors.content = this.renderCharacterLimitExceededError('details');
      }
    }

    if (!title) {
      errors.title = <FormattedMessage id="stripes-smart-components.notes.title.missing" />;
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.title = this.renderCharacterLimitExceededError('title');
    }

    return errors;
  }

  renderCharacterLimitExceededError(fieldName) {
    return <FormattedMessage id={`stripes-smart-components.notes.${fieldName}.lengthLimitExceeded`} />;
  }

  render() {
    const {
      onSubmit,
      noteTypes,
      referredEntityData,
      noteData,
      linkedEntitiesTypes,
      entityTypeTranslationKeyMap,
      entityTypePluralizedTranslationKeyMap,
      paneHeaderAppIcon,
      submitSucceeded,
    } = this.props;

    const {
      noteForm,
      assigned,
    } = this.state.sections;

    const isEditForm = this.isEditForm();

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
          <Fragment>
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
                        separator={false}
                        onToggle={this.handleSectionToggle}
                      >
                        {isEditForm && this.renderNoteMetadata()}
                        <NoteFields
                          detailsEditorRef={this.detailsEditorRef}
                          noteTypes={noteTypes}
                        />
                      </Accordion>
                      <Accordion
                        label={<FormattedMessage id="stripes-smart-components.notes.assigned" />}
                        id="assigned"
                        open={assigned}
                        onToggle={this.handleSectionToggle}
                      >
                        <AssignmentsList
                          referredEntityData={referredEntityData}
                          linkedEntitiesTypes={linkedEntitiesTypes}
                          entityTypeTranslationKeyMap={entityTypeTranslationKeyMap}
                          entityTypePluralizedTranslationKeyMap={entityTypePluralizedTranslationKeyMap}
                        />
                      </Accordion>
                    </Pane>
                  </Paneset>
                </Pane>
              </Paneset>
            </form>
            <NavigationModal when={!pristine && !submitSucceeded} />
          </Fragment>
        )}
      </Form>
    );
  }
}

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form } from 'react-final-form';
import { get } from 'lodash';
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
  Callout,
} from '@folio/stripes-components';

import NoteFields from './components/NoteFields';
import NavigationModal from '../NavigationModal';
import AssignmentsList from '../AssignmentsList';
import ReferredRecord from '../ReferredRecord';

import {
  noteDataShape,
  noteTypesShape,
  referredEntityDataShape,
} from './noteShapes';

import {
  MAX_TITLE_LENGTH,
  MAX_DETAILS_LENGTH,
} from '../../constants';

import styles from './NoteForm.css';

export default class NoteForm extends Component {
  static propTypes = {
    entityTypePluralizedTranslationKeys: PropTypes.objectOf(PropTypes.string),
    entityTypeTranslationKeys: PropTypes.objectOf(PropTypes.string).isRequired,
    navigateBack: PropTypes.func.isRequired,
    noteData: noteDataShape,
    noteMetadata: PropTypes.shape({
      createdBy: PropTypes.string,
      createdDate: PropTypes.string,
      lastUpdatedBy: PropTypes.string,
      lastUpdatedDate: PropTypes.string,
    }),
    noteTypes: noteTypesShape.isRequired,
    onSubmit: PropTypes.func.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    referredEntityData: PropTypes.oneOfType([
      referredEntityDataShape,
      PropTypes.bool
    ]),
    submitIsPending: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
  };

  state = {
    sections: {
      noteForm: true,
      assigned: false,
    }
  };

  componentDidMount() {
    if (!this.areNoteTypesPresent()) {
      this.displayMissingNoteTypesNotification();
    }
  }

  detailsEditorRef = React.createRef();
  calloutRef = React.createRef();
  sortedNoteTypes = this.getSortedNoteTypes();

  getSortedNoteTypes() {
    return [...this.props.noteTypes].sort(this.compareNoteTypes);
  }

  compareNoteTypes(a, b) {
    return a.label.localeCompare(b.label);
  }

  displayMissingNoteTypesNotification() {
    this.calloutRef.current.sendCallout({
      type: 'error',
      message: <FormattedMessage id="stripes-smart-components.notes.noteTypesMissing" />,
      timeout: 0,
    });
  }

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
    const { navigateBack } = this.props;

    return (
      <IconButton
        icon="times"
        onClick={navigateBack}
        data-test-leave-note-form
      />
    );
  }

  renderLastMenu = (formIsPristine) => {
    const { submitIsPending } = this.props;
    const noteTypesExist = this.areNoteTypesPresent();

    return (
      <Button
        type="submit"
        buttonStyle="primary"
        marginBottom0
        disabled={formIsPristine || submitIsPending || !noteTypesExist}
        data-test-save-note
      >
        <FormattedMessage id="stripes-smart-components.notes.saveAndClose" />
      </Button>
    );
  }

  renderReferredRecord() {
    const {
      referredEntityData,
      entityTypeTranslationKeys,
    } = this.props;

    return (
      <ReferredRecord
        referredEntityData={referredEntityData}
        entityTypeTranslationKeys={entityTypeTranslationKeys}
      />
    );
  }

  getActionMenu = ({ onToggle }) => {
    const { navigateBack } = this.props;

    return this.isEditForm() && (
      <Fragment>
        <Button
          buttonStyle="dropdownItem"
          onClick={() => {
            navigateBack();
            onToggle();
          }}
          data-test-leave-note-form
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

  areNoteTypesPresent() {
    return this.props.noteTypes.length;
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
      errors.title = (
        <span data-test-title-missing-error>
          <FormattedMessage id="stripes-smart-components.notes.title.missing" />
        </span>
      );
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.title = this.renderCharacterLimitExceededError('title');
    }

    return errors;
  }

  renderCharacterLimitExceededError(fieldName) {
    return (
      <span data-test-character-limit-error={fieldName}>
        <FormattedMessage id={`stripes-smart-components.notes.${fieldName}.lengthLimitExceeded`} />
      </span>
    );
  }

  render() {
    const {
      onSubmit,
      referredEntityData,
      noteData,
      entityTypePluralizedTranslationKeys,
      paneHeaderAppIcon,
      submitSucceeded,
    } = this.props;

    const {
      noteForm,
      assigned,
    } = this.state.sections;

    const isEditForm = this.isEditForm();
    const links = get(noteData, 'links', []);

    const paneTitle = isEditForm
      ? (
        <FormattedMessage
          id="stripes-smart-components.notes.editNoteTitle"
          values={{ noteTitle: noteData.title }}
        />
      )
      : <FormattedMessage id="stripes-smart-components.notes.newNote" />;

    const paneTitleAppIcon = <AppIcon app={paneHeaderAppIcon} size="small" />;
    const noteTypeInitialValue = isEditForm
      ? noteData.type
      : get(this.sortedNoteTypes, '[0].value');

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
                          noteTypes={this.sortedNoteTypes}
                          detailsEditorRef={this.detailsEditorRef}
                        />
                      </Accordion>
                      <Accordion
                        label={<FormattedMessage id="stripes-smart-components.notes.assigned" />}
                        id="assigned"
                        open={assigned}
                        closedByDefault
                        onToggle={this.handleSectionToggle}
                      >
                        {referredEntityData && this.renderReferredRecord()}
                        <AssignmentsList
                          links={links}
                          entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
                        />
                      </Accordion>
                    </Pane>
                  </Paneset>
                </Pane>
              </Paneset>
            </form>
            <NavigationModal when={!pristine && !submitSucceeded} />
            <Callout ref={this.calloutRef} />
          </Fragment>
        )}
      </Form>
    );
  }
}

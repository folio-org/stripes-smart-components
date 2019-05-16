/* eslint-disable react/no-danger */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import get from 'lodash/get';

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
  KeyValue,
} from '@folio/stripes-components';

import AssignmentsList from '../AssignmentsList';
import styles from './NoteForm.css';

import {
  linkedEntityTypesShape,
  noteDataShape,
  referredEntityDataShape,
} from './noteShapes';

export default class NoteView extends Component {
  static propTypes = {
    entityTypePluralizedTranslationKeyMap: PropTypes.objectOf(PropTypes.string),
    entityTypeTranslationKeyMap: PropTypes.objectOf(PropTypes.string),
    linkedEntityTypes: linkedEntityTypesShape,
    noteData: noteDataShape,
    noteMetadata: PropTypes.shape({
      createdBy: PropTypes.string,
      createdDate: PropTypes.string,
      lastUpdatedBy: PropTypes.string,
      lastUpdatedDate: PropTypes.string,
    }),
    onCancel: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onUnassign: PropTypes.func.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    referredEntityData: referredEntityDataShape.isRequired,
  };

  state = {
    sections: {
      noteGeneralInfo: true,
      assigned: true,
    }
  };

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

  renderLastMenu = () => {
    const { onEdit } = this.props;

    return (
      <Button
        type="button"
        buttonStyle="primary"
        marginBottom0
        onClick={onEdit}
      >
        <FormattedMessage id="stripes-smart-components.notes.edit" />
      </Button>
    );
  }

  getActionMenu = ({ onToggle }) => {
    const {
      onEdit,
      onDelete,
      onCopy,
      onUnassign,
    } = this.props;

    return (
      <Fragment>
        <Button
          buttonStyle="dropdownItem"
          onClick={() => {
            onEdit();
            onToggle();
          }}
        >
          <Icon icon="edit">
            <FormattedMessage id="stripes-smart-components.notes.edit" />
          </Icon>
        </Button>
        <Button
          buttonStyle="dropdownItem"
          onClick={() => {
            onCopy();
            onToggle();
          }}
        >
          <Icon icon="duplicate">
            <FormattedMessage id="stripes-smart-components.notes.copy" />
          </Icon>
        </Button>
        <Button
          buttonStyle="dropdownItem"
          onClick={() => {
            onUnassign();
            onToggle();
          }}
        >
          <Icon icon="document">
            <FormattedMessage id="stripes-smart-components.notes.unassign" />
          </Icon>
        </Button>
        <Button
          buttonStyle="dropdownItem"
          onClick={() => {
            onDelete();
            onToggle();
          }}
        >
          <Icon icon="trash">
            <FormattedMessage id="stripes-smart-components.notes.delete" />
          </Icon>
        </Button>
      </Fragment>
    );
  };

  render() {
    const {
      referredEntityData,
      noteData,
      linkedEntityTypes,
      entityTypeTranslationKeyMap,
      entityTypePluralizedTranslationKeyMap,
      paneHeaderAppIcon,
    } = this.props;

    const {
      noteGeneralInfo,
      assigned,
    } = this.state.sections;

    const noteContentMarkup = { __html: noteData.content };

    const paneTitle = noteData.title;

    const paneTitleAppIcon = <AppIcon app={paneHeaderAppIcon} size="small" />;

    return (
      <Paneset>
        <Pane
          paneTitle={paneTitle}
          appIcon={paneTitleAppIcon}
          actionMenu={this.getActionMenu}
          firstMenu={this.renderFirstMenu()}
          lastMenu={this.renderLastMenu()}
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
                id="noteGeneralInfo"
                open={noteGeneralInfo}
                separator={false}
                onToggle={this.handleSectionToggle}
              >
                {this.renderNoteMetadata()}
                <Row>
                  <Col xs={6}>
                    <KeyValue
                      label={<FormattedMessage id="stripes-smart-components.noteType" />}
                      value={get(noteData, 'type', '-')}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <KeyValue
                      label={<FormattedMessage id="stripes-smart-components.noteTitle" />}
                      value={get(noteData, 'title', '-')}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <KeyValue
                      label={<FormattedMessage id="stripes-smart-components.details" />}
                    >
                      <div dangerouslySetInnerHTML={noteContentMarkup} />
                    </KeyValue>
                  </Col>
                </Row>

              </Accordion>
              <Accordion
                label={<FormattedMessage id="stripes-smart-components.notes.assigned" />}
                id="assigned"
                open={assigned}
                onToggle={this.handleSectionToggle}
              >
                <AssignmentsList
                  referredEntityData={referredEntityData}
                  linkedEntityTypes={linkedEntityTypes}
                  entityTypeTranslationKeyMap={entityTypeTranslationKeyMap}
                  entityTypePluralizedTranslationKeyMap={entityTypePluralizedTranslationKeyMap}
                />
              </Accordion>
            </Pane>
          </Paneset>
        </Pane>
      </Paneset>
    );
  }
}

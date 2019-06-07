/* eslint-disable react/no-danger */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import get from 'lodash/get';
import {
  IfPermission,
  AppIcon,
} from '@folio/stripes-core';

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

import { NOTE_LINKS_MIN_NUMBER } from '../../../constants';
import AssignmentsList from '../../../components/AssignmentsList';
import ReferredRecord from '../../../components/ReferredRecord';
import styles from './NoteView.css';

import {
  noteDataShape,
  referredEntityDataShape,
} from '../../../components/NoteForm/noteShapes';

export default class NoteView extends Component {
  static propTypes = {
    entityTypePluralizedTranslationKeys: PropTypes.objectOf(PropTypes.string),
    entityTypeTranslationKeys: PropTypes.objectOf(PropTypes.string),
    noteData: noteDataShape,
    noteMetadata: PropTypes.shape({
      createdBy: PropTypes.string,
      createdDate: PropTypes.string,
      lastUpdatedBy: PropTypes.string,
      lastUpdatedDate: PropTypes.string,
    }),
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onUnassign: PropTypes.func.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    referredEntityData: PropTypes.oneOfType([
      referredEntityDataShape,
      PropTypes.bool
    ]),
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

  renderFirstMenu = () => {
    const { onCancel } = this.props;

    return (
      <IconButton
        icon="times"
        data-test-leave-note-view
        onClick={onCancel}
      />
    );
  }

  renderLastMenu = () => {
    const { onEdit } = this.props;

    return (
      <IfPermission perm="ui-notes.item.edit">
        <Button
          type="button"
          buttonStyle="primary"
          marginBottom0
          data-test-navigate-note-edit
          onClick={onEdit}
        >
          <FormattedMessage id="stripes-smart-components.notes.edit" />
        </Button>
      </IfPermission>
    );
  }

  getActionMenu = ({ onToggle }) => {
    const {
      onDelete,
      onUnassign,
      noteData,
      referredEntityData,
    } = this.props;

    const hasMoreThanOneAssignment = get(noteData, 'links.length', 0) > NOTE_LINKS_MIN_NUMBER;
    const canUnassign = hasMoreThanOneAssignment && referredEntityData;

    return (
      <Fragment>
        {
          canUnassign &&
          <IfPermission perm="ui-notes.item.assign-unassign">
            <Button
              buttonStyle="dropdownItem"
              data-test-note-unassign
              onClick={() => {
                onUnassign();
                onToggle();
              }}
            >
              <Icon icon="document">
                <FormattedMessage id="stripes-smart-components.notes.unassign" />
              </Icon>
            </Button>
          </IfPermission>
        }
        <IfPermission perm="ui-notes.item.delete">
          <Button
            buttonStyle="dropdownItem"
            data-test-note-delete
            onClick={() => {
              onDelete();
              onToggle();
            }}
          >
            <Icon icon="trash">
              <FormattedMessage id="stripes-smart-components.notes.delete" />
            </Icon>
          </Button>
        </IfPermission>
      </Fragment>
    );
  };

  render() {
    const {
      referredEntityData,
      noteData,
      entityTypePluralizedTranslationKeys,
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
              className={styles['note-view-content']}
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
                {referredEntityData && this.renderReferredRecord()}
                <AssignmentsList
                  links={noteData.links}
                  entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
                />
              </Accordion>
            </Pane>
          </Paneset>
        </Pane>
      </Paneset>
    );
  }
}

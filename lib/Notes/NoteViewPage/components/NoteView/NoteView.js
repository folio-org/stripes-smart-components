/* eslint-disable react/no-danger */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import get from 'lodash/get';
import {
  IfPermission,
  AppIcon,
} from '@folio/stripes-core';

import {
  Accordion,
  AccordionSet,
  ExpandAllButton,
  Pane,
  Paneset,
  Row,
  Col,
  Icon,
  IconButton,
  Button,
  KeyValue,
  NoValue,
} from '@folio/stripes-components';

import { NOTE_LINKS_MIN_NUMBER } from '../../../constants';
import AssignmentsList from '../../../components/AssignmentsList';
import ReferredRecord from '../../../components/ReferredRecord';
import NoteMetadata from '../../../components/NoteMetadata';

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
    renderReferredRecord: PropTypes.func,
  };

  state = {
    sections: {
      noteGeneralInfo: true,
      assigned: false,
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
      <Row end="xs">
        <Col xs>
          <ExpandAllButton
            accordionStatus={this.state.sections}
            onToggle={this.handleToggleAll}
            id="clickable-expand-all"
          />
        </Col>
      </Row>
    );
  }

  renderReferredRecordElement() {
    const {
      renderReferredRecord,
      referredEntityData,
      entityTypeTranslationKeys,
      noteData,
    } = this.props;

    return renderReferredRecord
      ? renderReferredRecord(noteData)
      : (
        <ReferredRecord
          referredEntityData={referredEntityData}
          entityTypeTranslationKeys={entityTypeTranslationKeys}
        />
      );
  }

  renderFirstMenu = () => {
    const { onCancel } = this.props;

    return (
      <FormattedMessage id="stripes-smart-components.cancelEdit">
        {([ariaLabel]) => (
          <IconButton
            icon="times"
            data-test-leave-note-view
            onClick={onCancel}
            aria-label={ariaLabel}
          />
        )}
      </FormattedMessage>
    );
  }

  getActionMenu = ({ onToggle }) => {
    const {
      onDelete,
      onUnassign,
      noteData,
      referredEntityData,
      onEdit,
    } = this.props;

    const hasMoreThanOneAssignment = get(noteData, 'links.length', 0) > NOTE_LINKS_MIN_NUMBER;
    const canUnassign = hasMoreThanOneAssignment && referredEntityData;

    return (
      <>
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
        <IfPermission perm="ui-notes.item.edit">
          <Button
            buttonStyle="dropdownItem"
            data-test-navigate-note-edit
            onClick={() => {
              onEdit();
              onToggle();
            }}
          >
            <Icon icon="edit">
              <FormattedMessage id="stripes-smart-components.notes.edit" />
            </Icon>
          </Button>
        </IfPermission>
      </>
    );
  };

  render() {
    const {
      referredEntityData,
      noteData,
      entityTypePluralizedTranslationKeys,
      paneHeaderAppIcon,
      noteMetadata,
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
          data-test-note-view
          paneTitle={paneTitle}
          appIcon={paneTitleAppIcon}
          actionMenu={this.getActionMenu}
          firstMenu={this.renderFirstMenu()}
          defaultWidth="100%"
        >
          <div className={styles['note-view-content']}>
            {this.renderExpandAllButton()}
            <AccordionSet>
              <Accordion
                label={<FormattedMessage id="stripes-smart-components.notes.generalInformation" />}
                id="noteGeneralInfo"
                open={noteGeneralInfo}
                separator={false}
                onToggle={this.handleSectionToggle}
              >
                <NoteMetadata
                  noteMetadata={noteMetadata}
                />
                <Row>
                  <Col xs={6}>
                    <KeyValue
                      label={<FormattedMessage id="stripes-smart-components.noteType" />}
                      value={
                        <span data-test-note-view-note-type>
                          {noteData?.type ?? <NoValue />}
                        </span>
                      }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <KeyValue
                      label={<FormattedMessage id="stripes-smart-components.noteTitle" />}
                      value={
                        <span data-test-note-view-note-title>
                          {noteData?.title ?? <NoValue />}
                        </span>
                      }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <KeyValue
                      label={<FormattedMessage id="stripes-smart-components.details" />}
                    >
                      <div
                        className="editor-preview"
                        data-test-note-view-note-details
                        dangerouslySetInnerHTML={noteContentMarkup}
                      />
                    </KeyValue>
                  </Col>
                </Row>

              </Accordion>
              <Accordion
                label={<FormattedMessage id="stripes-smart-components.notes.assigned" />}
                id="assigned"
                open={assigned}
                closedByDefault
                onToggle={this.handleSectionToggle}
              >
                {referredEntityData && this.renderReferredRecordElement()}
                <AssignmentsList
                  links={noteData.links}
                  entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
                />
              </Accordion>
            </AccordionSet>
          </div>
        </Pane>
      </Paneset>
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router';
import { get, cloneDeep } from 'lodash';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  stripesConnect,
  TitleManager,
} from '@folio/stripes-core';
import {
  Icon,
  ConfirmationModal,
} from '@folio/stripes-components';

import NoteView from './components/NoteView';
import { noteShape } from '../response-shapes';
import { referredEntityDataShape } from '../components/NoteForm/noteShapes';

@stripesConnect
class NoteViewPage extends Component {
  static propTypes = {
    entityTypePluralizedTranslationKeys: PropTypes.objectOf(PropTypes.string),
    entityTypeTranslationKeys: PropTypes.objectOf(PropTypes.string),
    mutator: PropTypes.shape({
      note: PropTypes.shape({
        DELETE: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    navigateBack: PropTypes.func.isRequired,
    noteId: PropTypes.string.isRequired,
    onEdit: PropTypes.func.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    referredEntityData: PropTypes.oneOfType([
      referredEntityDataShape,
      PropTypes.bool
    ]),
    resources: PropTypes.shape({
      note: PropTypes.shape({
        records: PropTypes.arrayOf(noteShape),
      }),
    }),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }),
  }

  static manifest = Object.freeze({
    note: {
      type: 'okapi',
      path: 'notes/!{noteId}',
      fetch: false,
      accumulate: true,
      PUT: {
        path: 'note-links/type/!{referredEntityData.type}/id/!{referredEntityData.id}'
      },
    },
  });

  state = {
    showDeleteConfirmDialog: false,
    showUnassignConfirmDialog: false,
    note: {},
  };

  componentDidMount() {
    this.props.mutator.note.reset();
    this.props.mutator.note.GET()
      .then(note => {
        this.setState({ note: cloneDeep(note) });
      });
  }

  renderSpinner() {
    return (
      <Icon icon="spinner-ellipsis" />
    );
  }

  getMetadata() {
    const { note } = this.state;
    const createdBy = get(note, 'metadata.createdByUsername');
    const createdDate = get(note, 'metadata.createdDate');
    const lastUpdatedBy = get(note, 'metadata.updatedByUsername');
    const lastUpdatedDate = get(note, 'metadata.updatedDate');
    const metadata = {
      contentId: 'noteViewMetadataContent',
      createdBy,
      createdDate,
      id: 'noteViewMetadata',
      lastUpdatedBy,
      lastUpdatedDate,
      showUserLink: false,
    };

    return metadata;
  }

  getNoteData() {
    const {
      content,
      type,
      title,
      links
    } = this.state.note;

    const noteData = {
      content,
      type,
      title,
      links,
    };

    return noteData;
  }

  getDeleteModalMessage() {
    const {
      title,
      links
    } = this.state.note;

    return (
      <>
        <span data-test-delete-confirmation-message>
          <SafeHTMLMessage
            id="stripes-smart-components.notes.delete.confirm.message"
            values={{ title, resourcesNumber: links.length }}
          />
        </span>
      </>
    );
  }

  getUnassignModalMessage() {
    const { title } = this.state.note;

    return (
      <SafeHTMLMessage
        id="stripes-smart-components.notes.unassign.confirm.message"
        values={{ title }}
      />
    );
  }

  onDelete = () => {
    this.setState({
      showDeleteConfirmDialog: true,
    });
  };

  onUnassign = () => {
    this.setState({
      showUnassignConfirmDialog: true,
    });
  };

  handleDelete = () => {
    const {
      mutator,
      noteId,
      navigateBack,
    } = this.props;

    return mutator.note.DELETE({ id: noteId })
      .finally(() => {
        mutator.note.reset();
        this.hideConfirmDeleteDialog();
        navigateBack();
      });
  };

  handleUnassign = () => {
    const {
      mutator,
      noteId,
      navigateBack,
    } = this.props;

    mutator.note.PUT({
      notes: [
        {
          id: noteId,
          status: 'UNASSIGNED',
        },
      ],
    })
      .finally(() => {
        this.hideConfirmUnassignDialog();
        navigateBack();
      });
  };

  hideConfirmDeleteDialog = () => {
    this.setState({
      showDeleteConfirmDialog: false,
    });
  };

  hideConfirmUnassignDialog = () => {
    this.setState({
      showUnassignConfirmDialog: false,
    });
  };

  renderViewPage = () => {
    const {
      referredEntityData,
      entityTypeTranslationKeys,
      entityTypePluralizedTranslationKeys,
      paneHeaderAppIcon,
      onEdit,
      navigateBack,
      stripes,
    } = this.props;

    if (!stripes.hasPerm('ui-notes.item.view')) {
      return <Redirect to="/" />;
    }

    const {
      title,
    } = this.state.note;

    return (
      <FormattedMessage
        id="stripes-smart-components.notes.editNote"
        values={{ noteTitle: title }}
      >
        {pageTitle => (
          <TitleManager record={pageTitle}>
            <NoteView
              referredEntityData={referredEntityData}
              entityTypeTranslationKeys={entityTypeTranslationKeys}
              entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
              paneHeaderAppIcon={paneHeaderAppIcon}
              noteMetadata={this.getMetadata()}
              noteData={this.getNoteData()}
              onCancel={navigateBack}
              onEdit={onEdit}
              onUnassign={this.onUnassign}
              onDelete={this.onDelete}
            />
            <ConfirmationModal
              id="confirm-delete-note"
              open={this.state.showDeleteConfirmDialog}
              heading={<FormattedMessage id="stripes-smart-components.notes.deleteNote" />}
              message={this.getDeleteModalMessage()}
              onConfirm={this.handleDelete}
              onCancel={this.hideConfirmDeleteDialog}
              confirmLabel={<FormattedMessage id="stripes-smart-components.notes.delete" />}
            />
            <ConfirmationModal
              id="confirm-unassign-note"
              open={this.state.showUnassignConfirmDialog}
              heading={(
                <FormattedMessage id="stripes-smart-components.notes.unassignNote" />
              )}
              message={this.getUnassignModalMessage()}
              onConfirm={this.handleUnassign}
              onCancel={this.hideConfirmUnassignDialog}
              confirmLabel={<FormattedMessage id="stripes-smart-components.notes.unassign" />}
            />
          </TitleManager>
        )}
      </FormattedMessage>
    );
  }

  render() {
    const { resources } = this.props;
    const {
      metadata,
      links,
    } = this.state.note;

    const noteLoaded = get(resources, ['note', 'hasLoaded']) &&
      metadata && links;

    return noteLoaded
      ? this.renderViewPage()
      : this.renderSpinner();
  }
}

export default NoteViewPage;

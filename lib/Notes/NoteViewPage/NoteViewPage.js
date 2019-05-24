import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get, cloneDeep } from 'lodash';

import {
  stripesConnect,
  TitleManager,
} from '@folio/stripes-core';
import {
  Icon,
  ConfirmationModal,
} from '@folio/stripes-components';

import AssignmentsList from '../AssignmentsList';
import { NoteView } from '../NoteForm';
import { noteShape } from '../response-shapes';

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
    referredEntityData: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      type: PropTypes.string,
    }),
    resources: PropTypes.shape({
      note: PropTypes.shape({
        records: PropTypes.arrayOf(noteShape),
      }),
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

  constructor(props) {
    super(props);

    this.state = {
      showDeleteConfirmDialog: false,
      showUnassignConfirmDialog: false,
      note: {},
    };
  }

  componentDidMount() {
    this.props.mutator.note.reset();
    this.props.mutator.note.GET()
      .then(records => {
        this.setState({ note: cloneDeep(records) });
      });
  }

  renderSpinner() {
    return (
      <Icon icon="spinner-ellipsis" />
    );
  }

  getMetadata() {
    const createdBy = get(this.state.note, 'metadata.createdByUsername');
    const createdDate = get(this.state.note, 'metadata.createdDate');
    const lastUpdatedBy = get(this.state.note, 'metadata.updatedByUsername');
    const lastUpdatedDate = get(this.state.note, 'metadata.updatedDate');
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
    // const content = get(resources, 'note.records[0].content');
    // const type = get(resources, 'note.records[0].type');
    // const title = get(resources, 'note.records[0].title');
    // const links = get(resources, 'note.records[0].links');
    const noteData = {
      content,
      type,
      title,
      links,
    };

    return noteData;
  }

  getDeleteModalMessage() {
    const { entityTypePluralizedTranslationKeys } = this.props;
    const {
      title,
      links
    } = this.state.note;
    // onst title = get(resources, 'note.records[0].title');
    // const links = get(resources, 'note.records[0].links');

    return (
      <Fragment>
        <FormattedMessage
          id="stripes-smart-components.notes.delete.confirm.message"
          values={{ title }}
        />
        <AssignmentsList
          links={links}
          entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
        />
      </Fragment>
    );
  }

  getUnassignModalMessage() {
    // const title = get(this.props.resources, 'note.records[0].title');
    const { title } = this.state.note;

    return (
      <FormattedMessage
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
    return this.props.mutator.note.DELETE({ id: this.props.noteId })
      .finally(() => {
        this.props.mutator.note.reset();
        this.hideConfirmDeleteDialog();
      });
  };

  handleUnassign = () => {
    this.props.mutator.note.PUT({
      notes: [
        {
          id: this.props.noteId,
          status: 'UNASSIGNED',
        },
      ],
    })
      .finally(() => {
        this.hideConfirmUnassignDialog();
      });
  };

  hideConfirmDeleteDialog = () => {
    this.setState({
      showDeleteConfirmDialog: false,
    }, this.props.navigateBack);
  };

  hideConfirmUnassignDialog = () => {
    this.setState({
      showUnassignConfirmDialog: false,
    }, this.props.navigateBack);
  };

  render() {
    const {
      referredEntityData,
      entityTypeTranslationKeys,
      entityTypePluralizedTranslationKeys,
      paneHeaderAppIcon,
      resources,
      onEdit,
      navigateBack,
    } = this.props;
    const {
      metadata,
      links
    } = this.state.note;

    const noteLoaded = get(resources, ['note', 'hasLoaded']) &&
      !get(resources, ['note', 'failded']) && metadata && links;

    return noteLoaded
      ? (
        <FormattedMessage id="stripes-smart-components.notes.newNote">
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
                heading={(
                  <FormattedMessage id="stripes-smart-components.notes.deleteNote" />
                )}
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
      )
      : this.renderSpinner();
  }
}

export default NoteViewPage;

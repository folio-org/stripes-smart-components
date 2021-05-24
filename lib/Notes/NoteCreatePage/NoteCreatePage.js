import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router';
import { get } from 'lodash';

import {
  stripesConnect,
  TitleManager,
  withNamespace,
} from '@folio/stripes-core';

import { Icon } from '@folio/stripes-components';

import NoteForm from '../components/NoteForm';
import { noteTypesCollectionShape } from '../response-shapes';
import { referredEntityDataShape } from '../components/NoteForm/noteShapes';
import { POPUP_NOTE_SESSION_STORAGE_PREFIX } from '../constants';

@stripesConnect
class NoteCreatePage extends Component {
  static propTypes = {
    domain: PropTypes.string.isRequired,
    entityTypeTranslationKeys: PropTypes.objectOf(PropTypes.string),
    mutator: PropTypes.shape({
      notes: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    namespace: PropTypes.string.isRequired,
    navigateBack: PropTypes.func.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    paneTitle: PropTypes.node,
    referredEntityData: referredEntityDataShape.isRequired,
    renderReferredRecord: PropTypes.func,
    resources: PropTypes.shape({
      noteTypesData: PropTypes.shape({
        records: PropTypes.arrayOf(noteTypesCollectionShape).isRequired,
      }),
    }).isRequired,
    showDisplayAsPopupOptions: PropTypes.bool,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }),
  }

  static defaultProps = {
    paneTitle: <FormattedMessage id="stripes-smart-components.notes.newNote" />,
    showDisplayAsPopupOptions: false,
  };

  static manifest = Object.freeze({
    noteTypesData: {
      type: 'okapi',
      path: 'note-types?limit=10000',
    },
    notes: {
      type: 'okapi',
      path: 'notes',
      fetch: false,
    },
  });

  state = {
    submitIsPending: false,
    submitSucceeded: false,
  };

  onSubmit = async (noteData) => {
    try {
      const { id } = await this.sendNoteData(noteData);
      this.handleSuccessResponse(id);
    } catch (err) {
      this.handleFailedResponse();
    }
  }

  sendNoteData(noteData) {
    this.setState({ submitIsPending: true });

    return this.props.mutator.notes.POST(this.serializeNoteData(noteData));
  }

  serializeNoteData = (formData) => {
    const {
      domain,
      referredEntityData: {
        id,
        type,
      },
    } = this.props;

    return {
      domain,
      typeId: formData.type,
      content: formData.content,
      title: formData.title,
      links: [{ type, id }],
      popUpOnCheckOut: formData.popUpOnCheckOut,
      popUpOnUser: formData.popUpOnUser,
    };
  }

  handleSuccessResponse(id) {
    sessionStorage.setItem(`${this.props.namespace}.${id}`, JSON.stringify({
      justCreated: true,
    }));

    this.setState({
      submitSucceeded: true,
      submitIsPending: false,
    }, this.props.navigateBack);
  }

  handleFailedResponse() {
    this.setState({ submitIsPending: false });
  }

  renderSpinner() {
    return (
      <Icon icon="spinner-ellipsis" />
    );
  }

  getNoteTypesSelectOptions = () => {
    const { noteTypes } = this.props.resources.noteTypesData.records[0];

    return noteTypes.map(noteType => ({
      label: noteType.name,
      value: noteType.id
    }));
  }

  render() {
    const {
      renderReferredRecord,
      referredEntityData,
      entityTypeTranslationKeys,
      paneHeaderAppIcon,
      paneTitle,
      navigateBack,
      stripes,
      showDisplayAsPopupOptions,
    } = this.props;

    const {
      submitIsPending,
      submitSucceeded,
    } = this.state;

    if (!stripes.hasPerm('ui-notes.item.create')) {
      return <Redirect to="/" />;
    }

    const noteTypesLoaded =
      get(this.props, ['resources', 'noteTypesData', 'hasLoaded'])
      && !get(this.props, ['resources', 'noteTypesData', 'isPending']);

    return noteTypesLoaded
      ? (
        <FormattedMessage id="stripes-smart-components.notes.newNote">
          {([pageTitle]) => (
            <TitleManager record={pageTitle}>
              <NoteForm
                renderReferredRecord={renderReferredRecord}
                noteTypes={this.getNoteTypesSelectOptions()}
                referredEntityData={referredEntityData}
                entityTypeTranslationKeys={entityTypeTranslationKeys}
                submitIsPending={submitIsPending}
                submitSucceeded={submitSucceeded}
                paneHeaderAppIcon={paneHeaderAppIcon}
                createFormTitle={paneTitle}
                onSubmit={this.onSubmit}
                navigateBack={navigateBack}
                showDisplayAsPopupOptions={showDisplayAsPopupOptions}
              />
            </TitleManager>
          )}
        </FormattedMessage>
      )
      : this.renderSpinner();
  }
}

export default withNamespace(NoteCreatePage, { key: POPUP_NOTE_SESSION_STORAGE_PREFIX });

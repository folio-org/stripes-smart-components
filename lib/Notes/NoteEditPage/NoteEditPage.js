import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router';
import { get } from 'lodash';

import {
  stripesConnect,
  TitleManager,
} from '@folio/stripes-core';

import { Icon } from '@folio/stripes-components';

import NoteForm from '../components/NoteForm';
import { noteTypesCollectionShape } from '../response-shapes';
import { referredEntityDataShape } from '../components/NoteForm/noteShapes';
import { getMetadataPropsFromResponse } from '../utils';

@stripesConnect
class NoteEditPage extends Component {
  static propTypes = {
    domain: PropTypes.string.isRequired,
    entityTypePluralizedTranslationKeys: PropTypes.objectOf(PropTypes.string),
    entityTypeTranslationKeys: PropTypes.objectOf(PropTypes.string),
    mutator: PropTypes.shape({
      note: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    navigateBack: PropTypes.func.isRequired,
    // noteId prop is used by manifest to PUT and GET note data
    // eslint-disable-next-line react/no-unused-prop-types
    noteId: PropTypes.string.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    referredEntityData: PropTypes.oneOfType([
      referredEntityDataShape,
      PropTypes.bool
    ]),
    renderReferredRecord: PropTypes.func,
    resources: PropTypes.shape({
      note: PropTypes.object,
      noteTypesData: PropTypes.shape({
        records: PropTypes.arrayOf(noteTypesCollectionShape).isRequired,
      }),
    }).isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }),
  }

  static manifest = Object.freeze({
    noteTypesData: {
      type: 'okapi',
      path: 'note-types?limit=10000',
    },
    note: {
      type: 'okapi',
      path: 'notes/!{noteId}',
    },
  });

  state = {
    submitIsPending: false,
    submitSucceeded: false,
  };

  onSubmit = async (noteData) => {
    try {
      await this.sendNoteData(noteData);
      this.handleSuccessResponse();
    } catch (err) {
      this.handleFailedResponse();
    }
  }

  sendNoteData(noteData) {
    this.setState({ submitIsPending: true });

    return this.props.mutator.note.PUT(this.serializeNoteData(noteData));
  }

  serializeNoteData = (formData) => {
    const {
      domain,
      resources,
    } = this.props;

    const { links } = resources.note.records[0];

    return {
      domain,
      typeId: formData.type,
      content: formData.content,
      title: formData.title,
      links,
    };
  }

  handleSuccessResponse() {
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

  getNoteFormData() {
    const {
      typeId: type,
      content,
      title,
      links,
    } = this.props.resources.note.records[0];

    return {
      type,
      content,
      title,
      links,
    };
  }

  renderNoteForm() {
    const {
      renderReferredRecord,
      referredEntityData,
      entityTypeTranslationKeys,
      entityTypePluralizedTranslationKeys,
      paneHeaderAppIcon,
      navigateBack,
    } = this.props;

    const {
      submitIsPending,
      submitSucceeded,
    } = this.state;

    const { metadata } = this.props.resources.note.records[0];
    const metadataProps = getMetadataPropsFromResponse(metadata);

    return (
      <FormattedMessage id="stripes-smart-components.notes.editNote">
        {pageTitle => (
          <TitleManager record={pageTitle}>
            <NoteForm
              noteData={this.getNoteFormData()}
              noteMetadata={metadataProps}
              noteTypes={this.getNoteTypesSelectOptions()}
              referredEntityData={referredEntityData}
              entityTypeTranslationKeys={entityTypeTranslationKeys}
              entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
              renderReferredRecord={renderReferredRecord}
              submitIsPending={submitIsPending}
              submitSucceeded={submitSucceeded}
              paneHeaderAppIcon={paneHeaderAppIcon}
              onSubmit={this.onSubmit}
              navigateBack={navigateBack}
            />
          </TitleManager>
        )}
      </FormattedMessage>
    );
  }

  render() {
    if (!this.props.stripes.hasPerm('ui-notes.item.edit')) {
      return <Redirect to="/" />;
    }

    const noteTypesLoaded = get(this.props, ['resources', 'noteTypesData', 'hasLoaded']);
    const noteDataLoaded = get(this.props, ['resources', 'note', 'hasLoaded']);

    return noteTypesLoaded && noteDataLoaded
      ? this.renderNoteForm()
      : this.renderSpinner();
  }
}

export default NoteEditPage;

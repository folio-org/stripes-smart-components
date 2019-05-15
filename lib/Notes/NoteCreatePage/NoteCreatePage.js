import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import {
  stripesConnect,
  TitleManager,
} from '@folio/stripes-core';

import { Icon } from '@folio/stripes-components';

import NoteForm from '../NoteForm';
import noteTypesCollectionShape from '../response-shapes';

@stripesConnect
class NoteCreatePage extends Component {
  static propTypes = {
    domain: PropTypes.string.isRequired,
    entityTypesTranslationKeys: PropTypes.objectOf(PropTypes.string),
    mutator: PropTypes.shape({
      notes: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    navigateBack: PropTypes.func.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    referredEntityData: PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      noteTypesData: noteTypesCollectionShape
    }),
  }

  static manifest = Object.freeze({
    noteTypesData: {
      type: 'okapi',
      path: 'note-types',
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
      await this.sendNoteData(noteData);
      this.handleSuccessResponse();
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
      links: [{ type, id }]
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

  render() {
    const {
      referredEntityData,
      entityTypesTranslationKeys,
      paneHeaderAppIcon,
      navigateBack,
    } = this.props;

    const {
      submitIsPending,
      submitSucceeded,
    } = this.state;

    const noteTypesLoaded = get(this.props, ['resources', 'noteTypesData', 'hasLoaded']);

    return noteTypesLoaded
      ? (
        <FormattedMessage id="stripes-smart-components.notes.newNote">
          {pageTitle => (
            <TitleManager record={pageTitle}>
              <NoteForm
                noteTypes={this.getNoteTypesSelectOptions()}
                referredEntityData={referredEntityData}
                entityTypesTranslationKeys={entityTypesTranslationKeys}
                submitIsPending={submitIsPending}
                submitSucceeded={submitSucceeded}
                paneHeaderAppIcon={paneHeaderAppIcon}
                onSubmit={this.onSubmit}
                navigateBack={navigateBack}
              />
            </TitleManager>
          )}
        </FormattedMessage>
      )
      : this.renderSpinner();
  }
}

export default NoteCreatePage;

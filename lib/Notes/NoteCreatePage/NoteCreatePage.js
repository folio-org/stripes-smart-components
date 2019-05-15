import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { get } from 'lodash';

import { stripesConnect } from '@folio/stripes-core';
import { Icon } from '@folio/stripes-components';

import NoteForm from '../NoteForm';
import noteTypesCollectionShape from '../response-shapes';

@stripesConnect
class NoteCreatePage extends Component {
  static propTypes = {
    domain: PropTypes.string.isRequired,
    entityTypeTranslationKeyMap: PropTypes.objectOf(PropTypes.string),
    mutator: PropTypes.shape({
      notes: PropTypes.shape({
        DELETE: PropTypes.func.isRequired,
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
      }).isRequired,
      noteTypesData: PropTypes.shape({
        DELETE: PropTypes.func.isRequired,
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
      }),
    }).isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    previousLocation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    referredEntityData: PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      noteTypesData: noteTypesCollectionShape
    }),
  }

  static manifest = {
    noteTypesData: {
      type: 'okapi',
      path: 'note-types',
    },
    notes: {
      type: 'okapi',
      path: 'notes',
      fetch: false,
    },
  }

  state = {
    submitIsPending: false,
    submitSucceeded: false,
  }

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
    });
  }

  handleFailedResponse() {
    this.setState({ submitIsPending: false });
  }

  renderNoteForm() {
    const {
      referredEntityData,
      entityTypeTranslationKeyMap,
      paneHeaderAppIcon,
      previousLocation,
    } = this.props;

    const {
      submitIsPending,
      submitSucceeded,
    } = this.state;

    const noteTypesLoaded = get(this.props, ['resources', 'noteTypesData', 'hasLoaded']);

    return noteTypesLoaded
      ? (
        <NoteForm
          noteTypes={this.getNoteTypesSelectProps()}
          referredEntityData={referredEntityData}
          entityTypeTranslationKeyMap={entityTypeTranslationKeyMap}
          submitIsPending={submitIsPending}
          submitSucceeded={submitSucceeded}
          previousLocation={previousLocation}
          paneHeaderAppIcon={paneHeaderAppIcon}
          onSubmit={this.onSubmit}
        />
      )
      : this.renderSpinner();
  }

  renderSpinner() {
    return (
      <Icon icon="spinner-ellipsis" />
    );
  }

  getNoteTypesSelectProps = () => {
    const { noteTypes } = this.props.resources.noteTypesData.records[0];

    return noteTypes.map(noteType => ({
      label: noteType.name,
      value: noteType.id
    }));
  }

  render() {
    return this.state.submitSucceeded
      ? <Redirect to={this.props.previousLocation} />
      : this.renderNoteForm();
  }
}

export default NoteCreatePage;

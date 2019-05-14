import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { get } from 'lodash';

import { stripesConnect } from '@folio/stripes-core';
import {
  Icon,
  Callout,
} from '@folio/stripes-components';

import NoteForm from '../NoteForm';
import noteTypesCollectionShape from '../response-shapes';

@stripesConnect
class NoteCreatePage extends Component {
  static propTypes = {
    domain: PropTypes.string.isRequired,
    entityTypeTranslationKeyMap: PropTypes.objectOf(PropTypes.string),
    mutator: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
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

  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.callout = React.createRef();
  }

  state = {
    submitIsPending: false,
    submitSucceeded: false,
  }

  getNoteTypesSelectProps = () => {
    const { noteTypes } = this.props.resources.noteTypesData.records[0];

    return noteTypes.map(noteType => ({
      label: noteType.name,
      value: noteType.id
    }));
  }

  async onSubmit(noteData) {
    try {
      const response = await this.sendNoteData(noteData);
      this.handleSuccessResponse(response);
    } catch (response) {
      const parsedResponse = await response.json();
      this.handleFailedResponse(parsedResponse);
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

  async handleSuccessResponse(response) {
    const calloutMessage = (
      <FormattedMessage
        id="stripes-smart-components.notes.noteCreated"
        values={{
          noteTitle: response.title
        }}
      />
    );

    await this.sendSuccessCallout(calloutMessage, 4000);

    this.setState({
      submitSucceeded: true,
      submitIsPending: false,
    });
  }

  sendSuccessCallout(message, timeout) {
    this.callout.current.sendCallout({
      type: 'success',
      message,
      timeout,
    });

    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  handleFailedResponse(response) {
    const errorMessage = response.errors[0].message;

    this.displayErrorCallout(errorMessage);
    this.setState({ submitIsPending: false });
  }

  displayErrorCallout = (message) => {
    this.callout.current.sendCallout({
      type: 'error',
      message,
    });
  }

  renderNoteForm() {
    const {
      referredEntityData,
      entityTypeTranslationKeyMap,
      paneHeaderAppIcon,
      onCancel,
    } = this.props;

    const {
      submitIsPending,
      submitSucceeded,
    } = this.state;

    const noteTypesLoaded = get(this.props, ['resources', 'noteTypesData', 'hasLoaded']);

    return noteTypesLoaded
      ? (
        <Fragment>
          <NoteForm
            onSubmit={this.onSubmit}
            onCancel={onCancel}
            noteTypes={this.getNoteTypesSelectProps()}
            referredEntityData={referredEntityData}
            entityTypeTranslationKeyMap={entityTypeTranslationKeyMap}
            paneHeaderAppIcon={paneHeaderAppIcon}
            submitIsPending={submitIsPending}
            submitSucceeded={submitSucceeded}
          />
          <Callout ref={this.callout} />
        </Fragment>
      )
      : this.renderSpinner();
  }

  renderSpinner() {
    return (
      <Icon icon="spinner-ellipsis" />
    );
  }

  render() {
    return this.state.submitSucceeded
      ? <Redirect to={this.props.previousLocation} />
      : this.renderNoteForm();
  }
}

export default NoteCreatePage;

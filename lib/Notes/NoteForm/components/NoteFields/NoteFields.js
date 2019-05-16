import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import {
  TextField,
  Select,
  Row,
  Col,
  Editor,
} from '@folio/stripes-components';

import { noteTypesShape } from '../../noteShapes';

export default class NoteFields extends Component {
  static propTypes = {
    detailsEditorRef: PropTypes.object,
    noteTypes: noteTypesShape.isRequired,
  };

  render() {
    const {
      noteTypes,
      detailsEditorRef,
    } = this.props;

    return (
      <Fragment>
        <Row>
          <Col xs={6}>
            <Field
              name="type"
              type="text"
              component={Select}
              dataOptions={noteTypes}
              label={<FormattedMessage id="stripes-smart-components.noteType" />}
              data-test-note-types-field
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Field
              name="title"
              type="text"
              component={TextField}
              label={<FormattedMessage id="stripes-smart-components.noteTitle" />}
              data-test-note-title-field
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Field
              name="content"
              type="text"
              editorRef={detailsEditorRef}
              component={Editor}
              label={<FormattedMessage id="stripes-smart-components.details" />}
              data-test-note-content-field
            />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

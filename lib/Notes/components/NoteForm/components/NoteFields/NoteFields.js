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

import styles from './NoteFields.css';

export default class NoteFields extends Component {
  static propTypes = {
    detailsEditorRef: PropTypes.object,
    noteTypes: noteTypesShape.isRequired,
  };

  getEditorClassName() {
    return this.props.noteTypes.length
      ? ''
      : styles['disabled-field'];
  }

  render() {
    const {
      noteTypes,
      detailsEditorRef,
    } = this.props;

    const fieldsAreDisabled = !noteTypes.length;

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
              disabled={fieldsAreDisabled}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <FormattedMessage id="stripes-smart-components.noteTitle">
              {label => (
                <Field
                  name="title"
                  type="text"
                  component={TextField}
                  label={label}
                  data-test-note-title-field
                  disabled={fieldsAreDisabled}
                  ariaLabel={label}
                />
              )}
            </FormattedMessage>
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
              readOnly={fieldsAreDisabled}
              editorClassName={this.getEditorClassName()}
            />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

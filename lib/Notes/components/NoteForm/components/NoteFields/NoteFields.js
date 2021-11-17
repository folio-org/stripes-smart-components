import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import {
  TextField,
  Select,
  Row,
  Col,
  Editor,
  Checkbox,
  Label,
} from '@folio/stripes-components';

import { noteTypesShape } from '../../noteShapes';

import styles from './NoteFields.css';

export default class NoteFields extends Component {
  static propTypes = {
    detailsEditorRef: PropTypes.object,
    noteTypes: noteTypesShape.isRequired,
    showDisplayAsPopupOptions: PropTypes.bool.isRequired,
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
      showDisplayAsPopupOptions,
    } = this.props;

    const fieldsAreDisabled = !noteTypes.length;

    return (
      <>
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
              {([label]) => (
                <Field
                  name="title"
                  type="text"
                  component={TextField}
                  label={label}
                  data-test-note-title-field
                  disabled={fieldsAreDisabled}
                  ariaLabel={label}
                  required
                />
              )}
            </FormattedMessage>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Field
              id="note-details-field"
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
        {showDisplayAsPopupOptions && (
          <Row>
            <Col xs={12}>
              <Row>
                <Col xs={12}>
                  <Label tagName="div">
                    <span className={styles.heading}>
                      <FormattedMessage id="stripes-smart-components.notes.displayAsPopup.label" />
                    </span>
                  </Label>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <Field
                    name="popUpOnCheckOut"
                    type="checkbox"
                    component={Checkbox}
                    data-test-note-popup-on-checkout-field
                    label={<FormattedMessage id="stripes-smart-components.notes.displayAsPopup.checkout" />}
                    readOnly={fieldsAreDisabled}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <Field
                    name="popUpOnUser"
                    type="checkbox"
                    component={Checkbox}
                    data-test-note-popup-on-users-field
                    label={<FormattedMessage id="stripes-smart-components.notes.displayAsPopup.users" />}
                    readOnly={fieldsAreDisabled}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      </>
    );
  }
}

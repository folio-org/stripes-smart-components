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

export default class NoteFields extends Component {
  static propTypes = {
    detailsEditorRef: PropTypes.object,
    noteTypes: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })).isRequired,
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
              label={<FormattedMessage id="stripes-smart-components.noteTypes" />}
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
            />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

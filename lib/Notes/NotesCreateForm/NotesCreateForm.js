import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Form,
  Field,
} from 'react-final-form';

import {
  Headline,
  TextField,
  Row,
  Col,
} from '@folio/stripes/components';

export default class NotesForm extends Component {
  static propTypes = {};

  render() {
    const {
      onSubmit,
    } = this.props;

    return (
      <Form
        // decorators={[focusOnErrors]}
        // mutators={{ ...arrayMutators }}
        onSubmit={onSubmit}
        render={({ handleSubmit, pristine }) => (
          <form onSubmit={handleSubmit} data-test-eholdings-package-create>
            <Row>
              <Col xs={4}>
                <Headline
                  tag="h3"
                  size="large"
                  faded
                >
                  <FormattedMessage id="stripes-smart-components.noteTypes" />
                </Headline>
                <div>
                  <Field
                    name="name"
                    type="text"
                    component={TextField}
                    label={<FormattedMessage id="stripes-smart-components.label.name.isRequired" />}
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <Headline
                  tag="h3"
                  size="large"
                  faded
                >
                  <FormattedMessage id="stripes-smart-components.noteTitle" />
                </Headline>
                <div>
                  <Field
                    name="name"
                    type="text"
                    component={TextField}
                    label={<FormattedMessage id="stripes-smart-components.label.name.isRequired" />}
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <Headline
                  tag="h3"
                  size="large"
                  faded
                >
                  <FormattedMessage id="stripes-smart-components.details" />
                </Headline>
                <div>
                  <Field
                    name="name"
                    type="text"
                    component={TextField}
                    label={<FormattedMessage id="stripes-smart-components.label.name.isRequired" />}
                  />
                </div>
              </Col>
            </Row>
          </form>
        )}
      />
    );
  }
}

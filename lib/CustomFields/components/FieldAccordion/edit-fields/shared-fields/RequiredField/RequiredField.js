import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import {
  Col,
  Checkbox,
} from '@folio/stripes-components';

const propTypes = {
  fieldNamePrefix: PropTypes.string.isRequired,
};

const RequiredField = ({ fieldNamePrefix }) => (
  <Col xs={2}>
    <Field
      component={Checkbox}
      type="checkbox"
      name={`${fieldNamePrefix}.required`}
      label={<FormattedMessage id="stripes-smart-components.customFields.required" />}
      vertical
      data-test-custom-fields-required-checkbox
    />
  </Col>
);

RequiredField.propTypes = propTypes;

export default RequiredField;

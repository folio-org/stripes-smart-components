import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import {
  Col,
  TextField,
} from '@folio/stripes-components';

const propTypes = { fieldNamePrefix: PropTypes.string.isRequired };

const validate = value => {
  if (!value) {
    return <FormattedMessage id="stripes-smart-components.customFields.fieldName.required" />;
  }
  if (value.length > 65) {
    return <FormattedMessage id="stripes-smart-components.customFields.fieldName.lengthLimit" />;
  }

  return null;
};

const NameField = ({ fieldNamePrefix }) => (
  <Col xs={3}>
    <Field
      component={TextField}
      name={`${fieldNamePrefix}.name`}
      label={<FormattedMessage id="stripes-smart-components.customFields.fieldLabel" />}
      required
      validate={validate}
    />
  </Col>
);

NameField.propTypes = propTypes;

export default NameField;

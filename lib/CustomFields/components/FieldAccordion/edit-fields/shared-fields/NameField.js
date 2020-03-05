import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  TextField,
} from '@folio/stripes-components';

const propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

const NameField = ({ value, onChange }) => (
  <Col xs={3}>
    <TextField
      name="name"
      label={<FormattedMessage id="stripes-smart-components.customFields.fieldLabel" />}
      value={value}
      required
      onChange={onChange}
    />
  </Col>
);

NameField.propTypes = propTypes;

export default NameField;

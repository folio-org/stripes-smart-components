import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Checkbox,
} from '@folio/stripes-components';

const propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

const RequiredField = ({ checked, onChange }) => (
  <Col xs={3}>
    <Checkbox
      name="required"
      label={<FormattedMessage id="stripes-smart-components.customFields.required" />}
      checked={checked}
      onChange={onChange}
    />
  </Col>
);

RequiredField.propTypes = propTypes;

export default RequiredField;

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Checkbox,
} from '@folio/stripes-components';

const propTypes = { value: PropTypes.bool.isRequired };

const RequiredValue = ({ value }) => (
  <Col data-test-custom-field-required xs={2}>
    <Checkbox
      checked={value}
      label={<FormattedMessage id="stripes-smart-components.customFields.required" />}
      disabled
      vertical
    />
  </Col>
);

RequiredValue.propTypes = propTypes;

export default RequiredValue;

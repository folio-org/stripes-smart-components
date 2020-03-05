import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
} from '@folio/stripes-components';

const propTypes = { value: PropTypes.string.isRequired };

const NameValue = ({ value }) => (
  <Col xs={3}>
    <KeyValue
      label={<FormattedMessage id="stripes-smart-components.customFields.fieldLabel" />}
      value={value}
    />
  </Col>
);

NameValue.propTypes = propTypes;

export default NameValue;
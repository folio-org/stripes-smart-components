import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
} from '@folio/stripes-components';

const propTypes = { value: PropTypes.string.isRequired };

const HelpTextValue = ({ value }) => (
  value.length
    ? (
      <Col data-test-custom-field-help-text xs={3}>
        <KeyValue
          label={<FormattedMessage id="stripes-smart-components.customFields.helperText" />}
          value={value}
        />
      </Col>
    )
    : null
);

HelpTextValue.propTypes = propTypes;

export default HelpTextValue;

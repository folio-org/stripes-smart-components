import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
} from '@folio/stripes-components';

const propTypes = { value: PropTypes.bool.isRequired };

const RequiredValue = ({ value }) => (
  <Col data-test-custom-field-required xs={3}>
    <KeyValue label={<FormattedMessage id="stripes-smart-components.customFields.required" />}>
      {
        value
          ? <FormattedMessage id="stripes-smart-components.customFields.required.checked" />
          : <FormattedMessage id="stripes-smart-components.customFields.required.unchecked" />
      }
    </KeyValue>
  </Col>
);

RequiredValue.propTypes = propTypes;

export default RequiredValue;

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

const HiddenField = ({ fieldNamePrefix }) => (
  <Col xs={3}>
    <Field
      type="checkbox"
      component={Checkbox}
      name={`${fieldNamePrefix}.hidden`}
      label={<FormattedMessage id="stripes-smart-components.customFields.hidden" />}
      vertical
    />
  </Col>
);

HiddenField.propTypes = propTypes;

export default HiddenField;

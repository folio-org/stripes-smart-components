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

const HiddenField = ({ checked, onChange }) => (
  <Col xs={3}>
    <Checkbox
      name="hidden"
      label={<FormattedMessage id="stripes-smart-components.customFields.hidden" />}
      checked={checked}
      onChange={onChange}
    />
  </Col>
);

HiddenField.propTypes = propTypes;

export default HiddenField;

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  TextField,
  InfoPopover,
} from '@folio/stripes-components';

const propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

const HelpTextFiled = ({ value, onChange }) => (
  <Col xs={3}>
    <TextField
      name="helpText"
      label={
        <>
          <FormattedMessage id="stripes-smart-components.customFields.helperText" />
          <InfoPopover
            content={<FormattedMessage id="stripes-smart-components.customFields.helperText.description" />}
            iconSize="small"
          />
        </>
      }
      value={value}
      onChange={onChange}
    />
  </Col>
);

HelpTextFiled.propTypes = propTypes;

export default HelpTextFiled;

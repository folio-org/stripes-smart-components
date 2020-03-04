import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Row,
  Checkbox,
  TextField,
  InfoPopover,
} from '@folio/stripes-components';

const propTypes = {
  onChange: PropTypes.func.isRequired,
  values: PropTypes.shape({
    helpText: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    required: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
  }),
};

const CheckboxFields = ({ onChange, values }) => {
  const handleChange = ({ target }) => {
    if (target.name === 'hidden') {
      onChange({ visible: !target.checked });
    } else {
      onChange({ [target.name]: target.value });
    }
  };

  return (
    <Row>
      <Col xs={3}>
        <Checkbox
          name="hidden"
          label={<FormattedMessage id="stripes-smart-components.customFields.hidden" />}
          checked={!values.visible}
          onChange={handleChange}
        />
      </Col>
      <Col xs={3}>
        <TextField
          name="name"
          label={<FormattedMessage id="stripes-smart-components.customFields.fieldLabel" />}
          value={values.name}
          required
          onChange={handleChange}
        />
      </Col>
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
          value={values.helpText}
          onChange={handleChange}
        />
      </Col>
    </Row>
  );
};

CheckboxFields.propTypes = propTypes;

export default CheckboxFields;

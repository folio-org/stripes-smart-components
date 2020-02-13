import React, { Fragment } from 'react';
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

const TextboxFields = ({ onChange, values }) => {
  const handleChange = ({ target }) => {
    if (target.name === 'hidden') {
      onChange({ visible: !target.checked });
    } else if (target.name === 'required') {
      onChange({ required: target.checked });
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
        <Checkbox
          name="required"
          label={<FormattedMessage id="stripes-smart-components.customFields.required" />}
          checked={values.required}
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
            <Fragment>
              <FormattedMessage id="stripes-smart-components.customFields.helperText" />
              <InfoPopover
                content={<FormattedMessage id="stripes-smart-components.customFields.helperText.description" />}
                iconSize="small"
              />
            </Fragment>
          }
          value={values.helpText}
          onChange={handleChange}
        />
      </Col>
    </Row>
  );
};

TextboxFields.propTypes = propTypes;

export default TextboxFields;

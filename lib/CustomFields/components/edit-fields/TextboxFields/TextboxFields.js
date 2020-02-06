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
          onChange={handleChange}
          checked={!values.visible}
        />
      </Col>
      <Col xs={3}>
        <Checkbox
          name="required"
          label={<FormattedMessage id="stripes-smart-components.customFields.required" />}
          onChange={handleChange}
          checked={values.required}
        />
      </Col>
      <Col xs={3}>
        <TextField
          name="name"
          onChange={handleChange}
          label={<FormattedMessage id="stripes-smart-components.customFields.fieldLabel" />}
          value={values.name}
          required
        />
      </Col>
      <Col xs={3}>
        <TextField
          name="helpText"
          onChange={handleChange}
          label={
            <Fragment>
              <span>
                <FormattedMessage id="stripes-smart-components.customFields.helperText" />
              </span>
              <InfoPopover
                content={<FormattedMessage id="stripes-smart-components.customFields.helperText.description" />}
                iconSize="medium"
              />
            </Fragment>
          }
          value={values.helpText}
        />
      </Col>
    </Row>
  );
};

TextboxFields.propTypes = propTypes;

export default TextboxFields;

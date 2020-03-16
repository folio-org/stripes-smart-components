import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
  RequiredField,
} from './shared-fields';

const propTypes = {
  fieldNamePrefix: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  values: PropTypes.shape({
    helpText: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    required: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
  }),
};

const TextboxFields = ({
  onChange,
  values,
  fieldNamePrefix,
}) => {
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
      <HiddenField
        fieldNamePrefix={fieldNamePrefix}
        checked={!values.visible}
        onChange={handleChange}
      />
      <RequiredField
        fieldNamePrefix={fieldNamePrefix}
        checked={values.required}
        onChange={handleChange}
      />
      <NameField
        fieldNamePrefix={fieldNamePrefix}
        value={values.name}
        onChange={handleChange}
      />
      <HelpTextField
        fieldNamePrefix={fieldNamePrefix}
        value={values.helpText}
        onChange={handleChange}
      />
    </Row>
  );
};

TextboxFields.propTypes = propTypes;

export default TextboxFields;

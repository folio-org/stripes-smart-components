import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
} from './shared-fields';

const propTypes = {
  onChange: PropTypes.func.isRequired,
  values: PropTypes.shape({
    helpText: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
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
      <HiddenField
        checked={!values.visible}
        onChange={handleChange}
      />
      <NameField
        value={values.name}
        onChange={handleChange}
      />
      <HelpTextField
        value={values.helpText}
        onChange={handleChange}
      />
    </Row>
  );
};

CheckboxFields.propTypes = propTypes;

export default CheckboxFields;

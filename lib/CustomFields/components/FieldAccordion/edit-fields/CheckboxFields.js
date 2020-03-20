import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
} from './shared-fields';

const propTypes = {
  fieldNamePrefix: PropTypes.string.isRequired,
};

const CheckboxFields = ({ fieldNamePrefix }) => {
  return (
    <Row>
      <HiddenField fieldNamePrefix={fieldNamePrefix} />
      <NameField fieldNamePrefix={fieldNamePrefix} />
      <HelpTextField fieldNamePrefix={fieldNamePrefix} />
    </Row>
  );
};

CheckboxFields.propTypes = propTypes;

export default CheckboxFields;

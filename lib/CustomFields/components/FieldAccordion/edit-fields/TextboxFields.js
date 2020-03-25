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
};

const TextboxFields = ({ fieldNamePrefix }) => {
  return (
    <Row>
      <HiddenField fieldNamePrefix={fieldNamePrefix} />
      <RequiredField fieldNamePrefix={fieldNamePrefix} />
      <NameField fieldNamePrefix={fieldNamePrefix} />
      <HelpTextField fieldNamePrefix={fieldNamePrefix} />
    </Row>
  );
};

TextboxFields.propTypes = propTypes;

export default TextboxFields;

import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
  RequiredField,
  OptionsField,
} from './shared-fields';

const propTypes = {
  changeFieldValue: PropTypes.func.isRequired,
  defaultOptions: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
};

const SingleSelectDropdownFields = ({ fieldNamePrefix, changeFieldValue, defaultOptions }) => (
  <>
    <Row>
      <HiddenField fieldNamePrefix={fieldNamePrefix} />
      <RequiredField fieldNamePrefix={fieldNamePrefix} />
      <NameField fieldNamePrefix={fieldNamePrefix} />
      <HelpTextField fieldNamePrefix={fieldNamePrefix} />
    </Row>
    <Row>
      <OptionsField
        fieldNamePrefix={fieldNamePrefix}
        changeFieldValue={changeFieldValue}
        defaultOptions={defaultOptions}
      />
    </Row>
  </>
);

SingleSelectDropdownFields.propTypes = propTypes;

export default SingleSelectDropdownFields;

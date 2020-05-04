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
import { fieldTypes } from '../../../constants';

const propTypes = {
  changeDefaultOptions: PropTypes.func.isRequired,
  changeFieldValue: PropTypes.func.isRequired,
  defaultOptions: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  values: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }),
};

const SelectDropdownFields = ({
  fieldNamePrefix,
  changeFieldValue,
  defaultOptions,
  values,
}) => {
  const isMultiSelect = values.type === fieldTypes.MULTISELECT;

  return (
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
          isMultiSelect={isMultiSelect}
          changeFieldValue={changeFieldValue}
          defaultOptions={defaultOptions}
        />
      </Row>
    </>
  );
};

SelectDropdownFields.propTypes = propTypes;

export default SelectDropdownFields;

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
  changeFieldValue: PropTypes.func.isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  onOptionDelete: PropTypes.func.isRequired,
  optionsStatsLoaded: PropTypes.bool.isRequired,
  usedOptions: PropTypes.arrayOf(PropTypes.string),
  values: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }),
};

const SelectDropdownFields = ({
  fieldNamePrefix,
  changeFieldValue,
  values,
  optionsStatsLoaded,
  usedOptions,
  onOptionDelete,
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
          optionsStatsLoaded={optionsStatsLoaded}
          usedOptions={usedOptions}
          onOptionDelete={onOptionDelete}
        />
      </Row>
    </>
  );
};

SelectDropdownFields.propTypes = propTypes;

export default SelectDropdownFields;

import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
  RequiredField,
  OptionsField,
  DisplayInAccordion,
} from './shared-fields';
import { fieldTypes } from '../../../constants';

const propTypes = {
  changeFieldValue: PropTypes.func.isRequired,
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  hasDisplayInAccordionField: PropTypes.bool.isRequired,
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
  displayInAccordionOptions,
  hasDisplayInAccordionField,
}) => {
  const isMultiSelect = values.type === fieldTypes.MULTISELECT;

  return (
    <>
      <Row>
        <NameField fieldNamePrefix={fieldNamePrefix} />
        <HelpTextField fieldNamePrefix={fieldNamePrefix} />
        {hasDisplayInAccordionField && (
          <DisplayInAccordion
            fieldNamePrefix={fieldNamePrefix}
            dataOptions={displayInAccordionOptions}
          />
        )}
        <HiddenField fieldNamePrefix={fieldNamePrefix} />
        <RequiredField fieldNamePrefix={fieldNamePrefix} />
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

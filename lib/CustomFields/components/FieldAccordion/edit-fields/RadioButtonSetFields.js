import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
  OptionsField,
  DisplayInAccordion,
  RequiredField,
} from './shared-fields';

const propTypes = {
  changeFieldValue: PropTypes.func.isRequired,
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  hasDisplayInAccordionField: PropTypes.bool.isRequired,
  onOptionDelete: PropTypes.func.isRequired,
  optionsStatsLoaded: PropTypes.bool.isRequired,
  usedOptions: PropTypes.arrayOf(PropTypes.string),
};

const RadioButtonSetFields = ({
  fieldNamePrefix,
  changeFieldValue,
  usedOptions,
  optionsStatsLoaded,
  onOptionDelete,
  displayInAccordionOptions,
  hasDisplayInAccordionField,
}) => {
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
          maxOptionsNumber={5}
          changeFieldValue={changeFieldValue}
          usedOptions={usedOptions}
          optionsStatsLoaded={optionsStatsLoaded}
          onOptionDelete={onOptionDelete}
        />
      </Row>
    </>
  );
};

RadioButtonSetFields.propTypes = propTypes;

export default RadioButtonSetFields;

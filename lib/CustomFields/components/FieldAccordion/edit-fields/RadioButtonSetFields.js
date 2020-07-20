import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
  OptionsField,
} from './shared-fields';

const propTypes = {
  changeFieldValue: PropTypes.func.isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
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
}) => {
  return (
    <>
      <Row>
        <HiddenField fieldNamePrefix={fieldNamePrefix} />
        <NameField fieldNamePrefix={fieldNamePrefix} />
        <HelpTextField fieldNamePrefix={fieldNamePrefix} />
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

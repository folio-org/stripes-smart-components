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
  onDragEnd: PropTypes.func.isRequired,
};

const RadioButtonSetFields = ({
  fieldNamePrefix,
  changeFieldValue,
  onDragEnd,
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
          onDragEnd={onDragEnd}
        />
      </Row>
    </>
  );
};

RadioButtonSetFields.propTypes = propTypes;

export default RadioButtonSetFields;

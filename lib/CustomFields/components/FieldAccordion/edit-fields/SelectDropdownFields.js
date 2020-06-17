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
  onDragEnd: PropTypes.func.isRequired,
  values: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }),
};

const SelectDropdownFields = ({
  fieldNamePrefix,
  changeFieldValue,
  values,
  onDragEnd,
}) => {
  const isMultiSelect = values.type === fieldTypes.MULTISELECT;
  const isSingleSelect = values.type === fieldTypes.SELECT;

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
          isSingleSelect={isSingleSelect}
          changeFieldValue={changeFieldValue}
          onDragEnd={onDragEnd}
        />
      </Row>
    </>
  );
};

SelectDropdownFields.propTypes = propTypes;

export default SelectDropdownFields;

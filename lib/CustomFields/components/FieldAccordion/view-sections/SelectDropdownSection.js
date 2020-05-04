import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HelpTextValue,
  NameValue,
  RequiredValue,
  Options,
} from './shared-values';
import { fieldTypes } from '../../../constants';

const propTypes = {
  helpText: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  selectField: PropTypes.shape({
    defaults: PropTypes.arrayOf(PropTypes.string),
    options: PropTypes.shape({
      sorted: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
  }),
};

const SelectDropdownSection = props => {
  const isMultiSelect = props.type === fieldTypes.MULTISELECT;

  return (
    <>
      <Row>
        <NameValue value={props.name} />
        <HelpTextValue value={props.helpText} />
        <RequiredValue value={props.required} />
      </Row>
      <Row>
        <Options
          selectField={props.selectField}
          isMultiSelect={isMultiSelect}
        />
      </Row>
    </>
  );
};

SelectDropdownSection.propTypes = propTypes;

export default SelectDropdownSection;

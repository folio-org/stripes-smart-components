import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HelpTextValue,
  NameValue,
  RequiredValue,
  Options,
  DisplayInAccordion,
  HiddenValue,
} from './shared-values';
import { fieldTypes } from '../../../constants';

const propTypes = {
  displayInAccordion: PropTypes.string,
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  hasDisplayInAccordionField: PropTypes.bool,
  helpText: PropTypes.string,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  selectField: PropTypes.shape({
    defaults: PropTypes.arrayOf(PropTypes.string),
    options: PropTypes.shape({
      sorted: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
  }),
  type: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
};

const SelectDropdownSection = props => {
  const isMultiSelect = props.type === fieldTypes.MULTISELECT;

  return (
    <>
      <Row>
        <NameValue value={props.name} />
        <HelpTextValue value={props.helpText} />
        {props.hasDisplayInAccordionField && (
          <DisplayInAccordion
            value={props.displayInAccordion}
            dataOptions={props.displayInAccordionOptions}
          />
        )}
        <HiddenValue value={props.visible} />
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

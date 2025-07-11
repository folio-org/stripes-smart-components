import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HelpTextValue,
  NameValue,
  Options,
  DisplayInAccordion,
  HiddenValue,
  RequiredValue,
} from './shared-values';

const propTypes = {
  displayInAccordion: PropTypes.string,
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  hasDisplayInAccordionField: PropTypes.bool,
  visible: PropTypes.bool.isRequired,
  required: PropTypes.bool.isRequired,
  helpText: PropTypes.string,
  name: PropTypes.string.isRequired,
  selectField: PropTypes.shape({
    defaults: PropTypes.arrayOf(PropTypes.string),
    options: PropTypes.shape({
      sorted: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
  }),
};

const RadioButtonSetSections = ({
  name,
  hasDisplayInAccordionField,
  helpText,
  selectField,
  displayInAccordion,
  displayInAccordionOptions,
  visible,
  required,
}) => (
  <>
    <Row>
      <NameValue value={name} />
      <HelpTextValue value={helpText} />
      {hasDisplayInAccordionField && (
        <DisplayInAccordion
          value={displayInAccordion}
          dataOptions={displayInAccordionOptions}
        />
      )}
      <HiddenValue value={visible} />
      <RequiredValue value={required} />
    </Row>
    <Row>
      <Options selectField={selectField} />
    </Row>
  </>
);

RadioButtonSetSections.propTypes = propTypes;

export default RadioButtonSetSections;

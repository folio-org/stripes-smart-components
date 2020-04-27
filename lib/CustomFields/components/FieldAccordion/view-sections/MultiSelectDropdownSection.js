import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HelpTextValue,
  NameValue,
  RequiredValue,
  Options,
} from './shared-values';

const propTypes = {
  helpText: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  selectField: PropTypes.shape({
    defaults: PropTypes.array,
    options: PropTypes.shape({
      sorted: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
  }),
};

const MultiSelectDropdownSection = props => (
  <>
    <Row>
      <NameValue value={props.name} />
      <HelpTextValue value={props.helpText} />
      <RequiredValue value={props.required} />
    </Row>
    <Row>
      <Options selectField={props.selectField} />
    </Row>
  </>
);

MultiSelectDropdownSection.propTypes = propTypes;

export default MultiSelectDropdownSection;

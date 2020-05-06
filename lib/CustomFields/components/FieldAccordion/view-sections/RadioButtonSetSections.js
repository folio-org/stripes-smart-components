import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HelpTextValue,
  NameValue,
  Options,
} from './shared-values';

const propTypes = {
  helpText: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  selectField: PropTypes.shape({
    defaults: PropTypes.array,
    options: PropTypes.shape({
      sorted: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
  }),
};

const RadioButtonSetSections = ({
  name,
  helpText,
  selectField,
}) => (
  <>
    <Row>
      <NameValue value={name} />
      <HelpTextValue value={helpText} />
    </Row>
    <Row>
      <Options selectField={selectField} />
    </Row>
  </>
);

RadioButtonSetSections.propTypes = propTypes;

export default RadioButtonSetSections;

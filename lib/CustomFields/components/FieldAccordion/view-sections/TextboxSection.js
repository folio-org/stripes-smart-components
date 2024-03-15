import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HelpTextValue,
  NameValue,
  RequiredValue,
} from './shared-values';

const propTypes = {
  helpText: PropTypes.string,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
};

const TextboxSection = props => (
  <Row>
    <NameValue value={props.name} />
    { props.helpText && <HelpTextValue value={props.helpText} /> }
    <RequiredValue value={props.required} />
  </Row>
);

TextboxSection.propTypes = propTypes;

export default TextboxSection;

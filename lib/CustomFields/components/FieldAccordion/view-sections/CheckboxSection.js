import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HelpTextValue,
  NameValue,
} from './shared-values';

const propTypes = {
  helpText: PropTypes.string,
  name: PropTypes.string.isRequired,
};

const CheckboxSection = props => (
  <Row>
    <NameValue value={props.name} />
    { props.helpText && <HelpTextValue value={props.helpText} /> }
  </Row>
);

CheckboxSection.propTypes = propTypes;

export default CheckboxSection;

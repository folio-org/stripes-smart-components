import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HelpTextValue,
  NameValue,
  DisplayInAccordion,
  HiddenValue,
} from './shared-values';

const propTypes = {
  displayInAccordion: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  helpText: PropTypes.string,
  name: PropTypes.string.isRequired,
};

const CheckboxSection = props => (
  <Row>
    <NameValue value={props.name} />
    <HelpTextValue value={props.helpText} />
    <DisplayInAccordion value={props.displayInAccordion} />
    <HiddenValue value={props.visible} />
  </Row>
);

CheckboxSection.propTypes = propTypes;

export default CheckboxSection;

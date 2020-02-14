import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Row,
  KeyValue,
  NoValue,
} from '@folio/stripes-components';

const propTypes = {
  helpText: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

const TextboxSection = props => (
  <Row>
    <Col xs={3}>
      <KeyValue label={<FormattedMessage id="stripes-smart-components.customFields.fieldLabel" />}>
        {props.name}
      </KeyValue>
    </Col>
    <Col xs={3}>
      <KeyValue label={<FormattedMessage id="stripes-smart-components.customFields.helperText" />}>
        {props.helpText || <NoValue />}
      </KeyValue>
    </Col>
  </Row>
);

TextboxSection.propTypes = propTypes;

export default TextboxSection;

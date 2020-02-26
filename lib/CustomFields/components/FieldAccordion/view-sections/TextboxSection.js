import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Row,
  KeyValue,
} from '@folio/stripes-components';

const propTypes = {
  helpText: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
};

const TextboxSection = props => (
  <Row>
    <Col xs={3}>
      <KeyValue label={<FormattedMessage id="stripes-smart-components.customFields.fieldLabel" />}>
        {props.name}
      </KeyValue>
    </Col>
    {
      props.helpText ? (
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="stripes-smart-components.customFields.helperText" />}>
            {props.helpText}
          </KeyValue>
        </Col>
      ) : null
    }
    <Col xs={3}>
      <KeyValue label={<FormattedMessage id="stripes-smart-components.customFields.required" />}>
        {
          props.required ? (
            <FormattedMessage id="stripes-smart-components.customFields.required.checked" />
          ) : <FormattedMessage id="stripes-smart-components.customFields.required.unchecked" />
        }
      </KeyValue>
    </Col>
  </Row>
);

TextboxSection.propTypes = propTypes;

export default TextboxSection;

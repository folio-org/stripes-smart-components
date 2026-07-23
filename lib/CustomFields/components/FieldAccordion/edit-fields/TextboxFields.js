import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
  RequiredField,
  DisplayInAccordion,
} from './shared-fields';

const propTypes = {
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  hasDisplayInAccordionField: PropTypes.bool.isRequired,
};

const TextboxFields = ({
  fieldNamePrefix,
  displayInAccordionOptions,
  hasDisplayInAccordionField,
}) => {
  return (
    <Row>
      <NameField fieldNamePrefix={fieldNamePrefix} />
      <HelpTextField fieldNamePrefix={fieldNamePrefix} />
      {hasDisplayInAccordionField && (
        <DisplayInAccordion
          fieldNamePrefix={fieldNamePrefix}
          dataOptions={displayInAccordionOptions}
        />
      )}
      <HiddenField fieldNamePrefix={fieldNamePrefix} />
      <RequiredField fieldNamePrefix={fieldNamePrefix} />
    </Row>
  );
};

TextboxFields.propTypes = propTypes;

export default TextboxFields;

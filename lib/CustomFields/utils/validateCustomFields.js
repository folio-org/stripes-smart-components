import React from 'react';
import { FormattedMessage } from 'react-intl';
import { fieldLimits } from '../constants';

const validateCustomFields = customField => value => {
  if (customField.required && !value) {
    return <FormattedMessage
      id="stripes-smart-components.customFields.fieldValue.required"
      values={{ field: customField.name }}
    />;
  }

  if (value?.length > fieldLimits[customField.type]) {
    return <FormattedMessage
      id="stripes-smart-components.customFields.fieldValue.length"
      values={{ field: customField.name }}
    />;
  }

  return null;
};

export default validateCustomFields;

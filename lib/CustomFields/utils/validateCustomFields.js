import React from 'react';
import { FormattedMessage } from 'react-intl';
import { fieldLimits } from '../constants';

const validateCustomFields = customField => value => {
  const isValueEmpty = Array.isArray(value) ? !value.length : !value;

  if (customField.required && isValueEmpty) {
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

  if (value && typeof value === 'string' && !value.trim()) {
    return <FormattedMessage id="stripes-smart-components.customFields.fieldValue.whitespace" />;
  }

  return null;
};

export default validateCustomFields;

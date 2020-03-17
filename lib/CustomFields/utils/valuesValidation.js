import React from 'react';
import { FormattedMessage } from 'react-intl';

const TEXTBOX_SHORT_MAX_LENGTH = 150;
const TEXTBOX_LONG_MAX_LENGTH = 1500;

const textBoxValidation = length => (value, customField) => {
  if (customField.required && !value) {
    return <FormattedMessage
      id="stripes-smart-components.customFields.fieldValue.required"
      values={{ field: customField.name }}
    />;
  }

  if (value?.length > length) {
    return <FormattedMessage
      id="stripes-smart-components.customFields.fieldValue.length"
      values={{ field: customField.name }}
    />;
  }

  return null;
};

// eslint-disable-next-line import/prefer-default-export
export const valuesValidation = {
  TEXTBOX_SHORT: textBoxValidation(TEXTBOX_SHORT_MAX_LENGTH),
  TEXTBOX_LONG: textBoxValidation(TEXTBOX_LONG_MAX_LENGTH),
};

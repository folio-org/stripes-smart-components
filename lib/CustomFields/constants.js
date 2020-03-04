import React from 'react';
import { FormattedMessage } from 'react-intl';

export const fieldTypes = {
  TEXTBOX_SHORT: 'TEXTBOX_SHORT',
  TEXTBOX_LONG: 'TEXTBOX_LONG',
  SINGLE_CHECKBOX: 'SINGLE_CHECKBOX',
};

export const fieldTypesLabels = {
  [fieldTypes.TEXTBOX_SHORT]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.TEXTBOX_SHORT" />,
  [fieldTypes.TEXTBOX_LONG]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.TEXTBOX_LONG" />,
  [fieldTypes.SINGLE_CHECKBOX]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.SINGLE_CHECKBOX" />,
};

export const defaultFieldConfigs = {
  [fieldTypes.TEXTBOX_SHORT]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.TEXTBOX_SHORT,
  },
  [fieldTypes.TEXTBOX_LONG]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.TEXTBOX_LONG,
  },
  [fieldTypes.SINGLE_CHECKBOX]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.SINGLE_CHECKBOX,
    checkboxField: {
      default: false,
    }
  },
};

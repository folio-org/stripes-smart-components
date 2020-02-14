import React from 'react';
import { FormattedMessage } from 'react-intl';

export const fieldTypes = {
  TEXTBOX_SHORT: 'TEXTBOX_SHORT',
};

export const fieldTypesLabels = {
  [fieldTypes.TEXTBOX_SHORT]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.TEXTBOX_SHORT" />
};

export const defaultFieldConfigs = {
  [fieldTypes.TEXTBOX_SHORT]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.TEXTBOX_SHORT,
  }
};

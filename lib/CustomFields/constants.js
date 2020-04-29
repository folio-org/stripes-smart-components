import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Checkbox,
  TextField,
  TextArea,
  Select,
} from '@folio/stripes-components';

export const fieldTypes = {
  TEXTFIELD: 'TEXTBOX_SHORT',
  TEXTAREA: 'TEXTBOX_LONG',
  CHECKBOX: 'SINGLE_CHECKBOX',
  SELECT: 'SINGLE_SELECT_DROPDOWN',
};

export const fieldTypesLabels = {
  [fieldTypes.TEXTFIELD]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.TEXTFIELD" />,
  [fieldTypes.TEXTAREA]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.TEXTAREA" />,
  [fieldTypes.CHECKBOX]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.CHECKBOX" />,
  [fieldTypes.SELECT]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.SELECT" />,
};

export const defaultFieldConfigs = {
  [fieldTypes.TEXTFIELD]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.TEXTFIELD,
  },
  [fieldTypes.TEXTAREA]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.TEXTAREA,
  },
  [fieldTypes.CHECKBOX]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.CHECKBOX,
    checkboxField: {
      default: false,
    }
  },
  [fieldTypes.SELECT]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.SELECT,
    selectField: {
      multiSelect: false,
      defaults: [],
      options: {
        values: [],
      }
    }
  }
};

export const fieldComponents = {
  [fieldTypes.TEXTFIELD]: TextField,
  [fieldTypes.TEXTAREA]: TextArea,
  [fieldTypes.CHECKBOX]: Checkbox,
  [fieldTypes.SELECT]: Select,
};

export const rowShapes = 12;

export const fieldLimits = {
  [fieldTypes.TEXTFIELD]: 150,
  [fieldTypes.TEXTAREA]: 1500,
};

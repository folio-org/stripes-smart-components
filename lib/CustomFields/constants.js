import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Checkbox,
  TextField,
  TextArea,
  Select,
  RadioButtonGroup,
} from '@folio/stripes-components';

export const fieldTypes = {
  TEXTFIELD: 'TEXTBOX_SHORT',
  TEXTAREA: 'TEXTBOX_LONG',
  CHECKBOX: 'SINGLE_CHECKBOX',
  SELECT: 'SINGLE_SELECT_DROPDOWN',
  MULTISELECT: 'MULTI_SELECT_DROPDOWN',
  RADIO_BUTTON_SET: 'RADIO_BUTTON',
};

export const fieldTypesLabels = {
  [fieldTypes.TEXTFIELD]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.TEXTFIELD" />,
  [fieldTypes.TEXTAREA]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.TEXTAREA" />,
  [fieldTypes.CHECKBOX]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.CHECKBOX" />,
  [fieldTypes.SELECT]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.SELECT" />,
  [fieldTypes.MULTISELECT]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.MULTISELECT" />,
  [fieldTypes.RADIO_BUTTON_SET]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.RADIO_BUTTON" />,
};
export const NO_DEFAULT_OPTIONS_VALUE = 'no-default';

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
      defaults: NO_DEFAULT_OPTIONS_VALUE,
      options: {
        values: ['', ''],
      }
    },
  },
  [fieldTypes.RADIO_BUTTON_SET]: {
    name: '',
    visible: true,
    helpText: '',
    type: fieldTypes.RADIO_BUTTON_SET,
    selectField: {
      multiSelect: false,
      defaults: NO_DEFAULT_OPTIONS_VALUE,
      options: {
        values: ['', ''],
      }
    },
  },
  [fieldTypes.MULTISELECT]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.MULTISELECT,
    selectField: {
      multiSelect: true,
      defaults: [],
      options: {
        values: ['', ''],
      }
    }
  }
};

export const fieldComponents = {
  [fieldTypes.TEXTFIELD]: TextField,
  [fieldTypes.TEXTAREA]: TextArea,
  [fieldTypes.CHECKBOX]: Checkbox,
  [fieldTypes.SELECT]: Select,
  [fieldTypes.RADIO_BUTTON_SET]: RadioButtonGroup,
};

export const rowShapes = 12;

export const fieldLimits = {
  [fieldTypes.TEXTFIELD]: 150,
  [fieldTypes.TEXTAREA]: 1500,
};

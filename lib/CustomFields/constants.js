import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Checkbox,
  TextField,
  TextArea,
  Select,
} from '@folio/stripes-components';

export const fieldTypes = {
  TEXTBOX_SHORT: 'TEXTBOX_SHORT',
  TEXTBOX_LONG: 'TEXTBOX_LONG',
  SINGLE_CHECKBOX: 'SINGLE_CHECKBOX',
  SINGLE_SELECT_DROPDOWN: 'SINGLE_SELECT_DROPDOWN',
};

export const fieldTypesLabels = {
  [fieldTypes.TEXTBOX_SHORT]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.TEXTBOX_SHORT" />,
  [fieldTypes.TEXTBOX_LONG]: <FormattedMessage id="stripes-smart-components.customFields.fieldTypes.TEXTBOX_LONG" />,
  // eslint-disable-next-line max-len
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

export const fieldComponents = {
  [fieldTypes.TEXTBOX_SHORT]: TextField,
  [fieldTypes.TEXTBOX_LONG]: TextArea,
  [fieldTypes.SINGLE_CHECKBOX]: Checkbox,
  [fieldTypes.SINGLE_SELECT_DROPDOWN]: Select,
};

export const rowShapes = 12;

export const fieldLimits = {
  [fieldTypes.TEXTBOX_SHORT]: 150,
  [fieldTypes.TEXTBOX_LONG]: 1500,
};

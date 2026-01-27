import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Checkbox,
  Datepicker,
  TextField,
  TextArea,
  Select,
  RadioButtonGroup,
  MultiSelection,
} from '@folio/stripes-components';

export const fieldTypes = {
  TEXTFIELD: 'TEXTBOX_SHORT',
  TEXTAREA: 'TEXTBOX_LONG',
  CHECKBOX: 'SINGLE_CHECKBOX',
  SELECT: 'SINGLE_SELECT_DROPDOWN',
  MULTISELECT: 'MULTI_SELECT_DROPDOWN',
  RADIO_BUTTON_GROUP: 'RADIO_BUTTON',
  DATE_PICKER: 'DATE_PICKER',
};

export const fieldTypesLabelIds = {
  [fieldTypes.TEXTFIELD]: 'stripes-smart-components.customFields.fieldTypes.TEXTFIELD',
  [fieldTypes.TEXTAREA]: 'stripes-smart-components.customFields.fieldTypes.TEXTAREA',
  [fieldTypes.CHECKBOX]: 'stripes-smart-components.customFields.fieldTypes.CHECKBOX',
  [fieldTypes.SELECT]: 'stripes-smart-components.customFields.fieldTypes.SELECT',
  [fieldTypes.MULTISELECT]: 'stripes-smart-components.customFields.fieldTypes.MULTISELECT',
  [fieldTypes.RADIO_BUTTON_GROUP]: 'stripes-smart-components.customFields.fieldTypes.RADIO_BUTTON',
  [fieldTypes.DATE_PICKER]: 'stripes-smart-components.customFields.fieldTypes.DATE_PICKER',
};

export const fieldTypesLabels = {
  [fieldTypes.TEXTFIELD]: <FormattedMessage id={fieldTypesLabelIds[fieldTypes.TEXTFIELD]} />,
  [fieldTypes.TEXTAREA]: <FormattedMessage id={fieldTypesLabelIds[fieldTypes.TEXTAREA]} />,
  [fieldTypes.CHECKBOX]: <FormattedMessage id={fieldTypesLabelIds[fieldTypes.CHECKBOX]} />,
  [fieldTypes.SELECT]: <FormattedMessage id={fieldTypesLabelIds[fieldTypes.SELECT]} />,
  [fieldTypes.MULTISELECT]: <FormattedMessage id={fieldTypesLabelIds[fieldTypes.MULTISELECT]} />,
  [fieldTypes.RADIO_BUTTON_GROUP]: <FormattedMessage id={fieldTypesLabelIds[fieldTypes.RADIO_BUTTON_GROUP]} />,
  [fieldTypes.DATE_PICKER]: <FormattedMessage id={fieldTypesLabelIds[fieldTypes.DATE_PICKER]} />,
};

export const NO_DEFAULT_OPTIONS_VALUE = 'no-default';
export const CUSTOM_FIELDS_SECTION_ID = 'default';

export const getDefaultFieldConfigs = ({ hasDisplayInAccordionField }) => ({
  [fieldTypes.TEXTFIELD]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.TEXTFIELD,
    ...(hasDisplayInAccordionField && { displayInAccordion: CUSTOM_FIELDS_SECTION_ID }),
  },
  [fieldTypes.TEXTAREA]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.TEXTAREA,
    ...(hasDisplayInAccordionField && { displayInAccordion: CUSTOM_FIELDS_SECTION_ID }),
  },
  [fieldTypes.CHECKBOX]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.CHECKBOX,
    checkboxField: {
      default: false,
    },
    ...(hasDisplayInAccordionField && { displayInAccordion: CUSTOM_FIELDS_SECTION_ID }),
  },
  [fieldTypes.SELECT]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.SELECT,
    ...(hasDisplayInAccordionField && { displayInAccordion: CUSTOM_FIELDS_SECTION_ID }),
    selectField: {
      multiSelect: false,
      options: {
        values: [{
          id: 'opt_0',
          value: '',
          default: false,
        }, {
          id: 'opt_1',
          value: '',
          default: false,
        }],
      }
    },
  },
  [fieldTypes.RADIO_BUTTON_GROUP]: {
    name: '',
    visible: true,
    helpText: '',
    type: fieldTypes.RADIO_BUTTON_GROUP,
    ...(hasDisplayInAccordionField && { displayInAccordion: CUSTOM_FIELDS_SECTION_ID }),
    selectField: {
      multiSelect: false,
      options: {
        values: [{
          id: 'opt_0',
          value: '',
          default: false,
        }, {
          id: 'opt_1',
          value: '',
          default: false,
        }],
      }
    },
  },
  [fieldTypes.MULTISELECT]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.MULTISELECT,
    ...(hasDisplayInAccordionField && { displayInAccordion: CUSTOM_FIELDS_SECTION_ID }),
    selectField: {
      multiSelect: true,
      options: {
        values: [{
          value: '',
          id: 'opt_0',
          default: false,
        }, {
          value: '',
          id: 'opt_1',
          default: false,
        }],
      }
    }
  },
  [fieldTypes.DATE_PICKER]: {
    name: '',
    visible: true,
    required: false,
    helpText: '',
    type: fieldTypes.DATE_PICKER,
    ...(hasDisplayInAccordionField && { displayInAccordion: CUSTOM_FIELDS_SECTION_ID }),
  }
});

export const fieldComponents = {
  [fieldTypes.TEXTFIELD]: TextField,
  [fieldTypes.TEXTAREA]: TextArea,
  [fieldTypes.CHECKBOX]: Checkbox,
  [fieldTypes.SELECT]: Select,
  [fieldTypes.RADIO_BUTTON_GROUP]: RadioButtonGroup,
  [fieldTypes.MULTISELECT]: MultiSelection,
  [fieldTypes.DATE_PICKER]: Datepicker,
};

export const rowShapes = 12;

export const fieldLimits = {
  [fieldTypes.TEXTFIELD]: 150,
  [fieldTypes.TEXTAREA]: 1500,
};

export const fieldTypesWithOptions = [fieldTypes.SELECT, fieldTypes.MULTISELECT, fieldTypes.RADIO_BUTTON_GROUP];

export const CUSTOM_FIELDS_SYSTEM_REF_IDS = ['originaltenantid'];

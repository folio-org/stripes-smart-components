import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Icon,
  IconButton,
  Tooltip,
} from '@folio/stripes-components';

import * as editFields from './edit-fields';
import * as viewSections from './view-sections';
import {
  fieldTypes,
  fieldTypesLabels,
  fieldTypesWithOptions,
} from '../../constants';
import { permissionsShape } from '../../shapes';

const editFieldsByType = {
  [fieldTypes.TEXTFIELD]: editFields.TextboxFields,
  [fieldTypes.TEXTAREA]: editFields.TextboxFields,
  [fieldTypes.CHECKBOX]: editFields.CheckboxFields,
  [fieldTypes.RADIO_BUTTON_GROUP]: editFields.RadioButtonSetFields,
  [fieldTypes.SELECT]: editFields.SelectDropdownFields,
  [fieldTypes.MULTISELECT]: editFields.SelectDropdownFields,
};

const viewSectionsByType = {
  [fieldTypes.TEXTFIELD]: viewSections.TextboxViewSection,
  [fieldTypes.TEXTAREA]: viewSections.TextboxViewSection,
  [fieldTypes.CHECKBOX]: viewSections.CheckboxViewSection,
  [fieldTypes.RADIO_BUTTON_GROUP]: viewSections.RadioButtonSetSection,
  [fieldTypes.SELECT]: viewSections.SelectDropdownSection,
  [fieldTypes.MULTISELECT]: viewSections.SelectDropdownSection,
};

const propTypes = {
  changeFieldValue: PropTypes.func,
  deleteCustomField: PropTypes.func,
  dragHandleProps: PropTypes.object,
  fieldData: PropTypes.shape({
    hidden: PropTypes.bool,
    name: PropTypes.string,
    required: PropTypes.bool,
    type: PropTypes.oneOf(Object.values(fieldTypes)).isRequired,
  }).isRequired,
  fieldNamePrefix: PropTypes.string,
  id: PropTypes.string.isRequired,
  isDragDisabled: PropTypes.bool,
  isEditMode: PropTypes.bool,
  onChange: PropTypes.func,
  onOptionDelete: PropTypes.func.isRequired,
  optionsStatsLoaded: PropTypes.bool.isRequired,
  permissions: permissionsShape.isRequired,
  separator: PropTypes.bool,
  usedOptions: PropTypes.arrayOf(PropTypes.string),
};

const FieldAccordion = (props) => {
  const {
    id,
    separator,
    isEditMode,
    deleteCustomField,
    fieldData: {
      name,
      type,
      hidden,
    },
    fieldData,
    onChange,
    permissions,
    fieldNamePrefix,
    dragHandleProps,
    isDragDisabled,
    changeFieldValue,
    usedOptions,
    optionsStatsLoaded,
    onOptionDelete,
  } = props;
  const accordionLabel = (
    <>
      {name || <FormattedMessage id="stripes-smart-components.customFields.fieldName.noSet" />}
      {' · '}
      {fieldTypesLabels[type]}
      {' '}
      {hidden && <FormattedMessage id="stripes-smart-components.customFields.settings.accordion.hidden" />}
    </>
  );

  const renderHeaderButtons = () => {
    return (
      <>
        {permissions.canDelete
          ? (
            <IconButton
              icon="trash"
              onClick={deleteCustomField}
              data-test-custom-field-delete-button
            />
          )
          : null
        }
        {permissions.canEdit && !isDragDisabled
          ? (
            <FormattedMessage id="stripes-smart-components.customFields.dragDrop">
              {(message) => (
                <Tooltip
                  text={message}
                  id="custom-field-drag-drop-button-tooltip"
                >
                  {({ ref, ariaIds }) => (
                    <Icon
                      icon="drag-drop"
                      data-test-custom-field-drag-drop-button
                      {...dragHandleProps}
                      aria-labelledby={ariaIds.text}
                      aria-describedby={ariaIds.sub}
                      ref={ref}
                    />
                  )}
                </Tooltip>
              )}
            </FormattedMessage>
          )
          : null
        }
      </>
    );
  };

  const AccordionContent = isEditMode
    ? editFieldsByType[type] || (() => null)
    : viewSectionsByType[type] || (() => null);

  const contentProps = isEditMode
    ? {
      onChange,
      values: { ...fieldData },
      fieldNamePrefix,
      changeFieldValue,
    }
    : { ...fieldData };

  if (fieldTypesWithOptions.includes(fieldData.type) && isEditMode) {
    contentProps.usedOptions = usedOptions;
    contentProps.optionsStatsLoaded = optionsStatsLoaded;
    contentProps.onOptionDelete = onOptionDelete(id);
  }

  return (
    <Accordion
      id={id}
      label={accordionLabel}
      displayWhenOpen={isEditMode && renderHeaderButtons()}
      displayWhenClosed={isEditMode && renderHeaderButtons()}
      separator={separator}
      closedByDefault={!isEditMode}
    >
      <AccordionContent {...contentProps} />
    </Accordion>
  );
};

FieldAccordion.propTypes = propTypes;

export default FieldAccordion;

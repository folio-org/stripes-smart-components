import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  IconButton,
} from '@folio/stripes-components';

import * as editFields from './edit-fields';
import * as viewSections from './view-sections';
import { fieldTypes } from '../../constants';

const editFieldsByType = {
  [fieldTypes.TEXTFIELD]: editFields.TextboxFields,
  [fieldTypes.TEXTAREA]: editFields.TextboxFields,
  [fieldTypes.CHECKBOX]: editFields.CheckboxFields,
  [fieldTypes.SELECT]: editFields.SingleSelectDropdown,
};

const viewSectionsByType = {
  [fieldTypes.TEXTFIELD]: viewSections.TextboxViewSection,
  [fieldTypes.TEXTAREA]: viewSections.TextboxViewSection,
  [fieldTypes.CHECKBOX]: viewSections.CheckboxViewSection,
  [fieldTypes.SELECT]: viewSections.SingleSelectDropdownSection,
};

const propTypes = {
  deleteCustomField: PropTypes.func,
  fieldData: PropTypes.shape({
    hidden: PropTypes.bool,
    name: PropTypes.string,
    required: PropTypes.bool,
    type: PropTypes.oneOf(Object.values(fieldTypes)).isRequired,
  }).isRequired,
  fieldNamePrefix: PropTypes.string,
  id: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool,
  onChange: PropTypes.func,
  permissions: PropTypes.shape({
    canDelete: PropTypes.bool,
    canEdit: PropTypes.bool,
    canView: PropTypes.bool,
  }).isRequired,
  separator: PropTypes.bool,
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
  } = props;
  const accordionLabel = (
    <>
      {name || <FormattedMessage id="stripes-smart-components.customFields.fieldName.noSet" />}
      {' · '}
      <FormattedMessage id={`stripes-smart-components.customFields.fieldTypes.${type}`} />
      {' '}
      {hidden && <FormattedMessage id="stripes-smart-components.customFields.settings.accordion.hidden" />}
    </>
  );

  const renderHeaderButtons = () => (
    permissions.canDelete
      ? (
        <IconButton
          icon="trash"
          onClick={deleteCustomField}
          data-test-custom-field-delete-button
        />
      )
      : null
  );

  const AccordionContent = isEditMode
    ? editFieldsByType[type] || (() => null)
    : viewSectionsByType[type] || (() => null);

  const contentProps = isEditMode
    ? {
      onChange,
      values: { ...fieldData },
      fieldNamePrefix,
    }
    : { ...fieldData };

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

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
  [fieldTypes.TEXTBOX_SHORT]: editFields.TextboxFields,
  [fieldTypes.TEXTBOX_LONG]: editFields.TextboxFields,
};

const viewSectionsByType = {
  [fieldTypes.TEXTBOX_SHORT]: viewSections.TextboxViewSection,
  [fieldTypes.TEXTBOX_LONG]: viewSections.TextboxViewSection,
};

const propTypes = {
  deleteCustomField: PropTypes.func,
  fieldData: PropTypes.shape({
    name: PropTypes.string,
    required: PropTypes.bool,
    type: PropTypes.oneOf(Object.values(fieldTypes)).isRequired,
    visible: PropTypes.bool,
  }).isRequired,
  id: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool,
  onChange: PropTypes.func,
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
      visible,
    },
    fieldData,
    onChange,
  } = props;

  const accordionLabel = (
    <>
      {name || <FormattedMessage id="stripes-smart-components.customFields.fieldName.noSet" />}
      {' · '}
      <FormattedMessage id={`stripes-smart-components.customFields.fieldTypes.${type}`} />
      {' '}
      {!visible && <FormattedMessage id="stripes-smart-components.customFields.settings.accordion.hidden" />}
    </>
  );

  const renderHeaderButtons = () => (
    <IconButton
      icon="trash"
      onClick={deleteCustomField}
    />
  );

  const AccordionContent = isEditMode
    ? editFieldsByType[type]
    : viewSectionsByType[type];

  const contentProps = isEditMode
    ? {
      onChange,
      values: { ...fieldData }
    }
    : { ...fieldData };

  return (
    <Accordion
      id={id}
      label={accordionLabel}
      displayWhenOpen={isEditMode && renderHeaderButtons()}
      displayWhenClosed={isEditMode && renderHeaderButtons()}
      separator={separator}
      closedByDefault
    >
      <AccordionContent {...contentProps} />
    </Accordion>
  );
};

FieldAccordion.propTypes = propTypes;

export default FieldAccordion;

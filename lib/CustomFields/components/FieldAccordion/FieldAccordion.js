import React, { Fragment } from 'react';
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
};

const viewSectionsByType = {
  [fieldTypes.TEXTBOX_SHORT]: viewSections.TextboxViewSection,
};

const propTypes = {
  deleteCustomField: PropTypes.func,
  editMode: PropTypes.bool,
  fieldData: PropTypes.shape({
    name: PropTypes.string,
    required: PropTypes.bool,
    type: PropTypes.oneOf(Object.values(fieldTypes)).isRequired,
    visible: PropTypes.bool,
  }).isRequired,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  separator: PropTypes.bool,
};

const FieldAccordion = (props) => {
  const {
    id,
    separator,
    editMode,
    deleteCustomField,
    fieldData: {
      name,
      type,
      required,
      visible,
    },
    fieldData,
    onChange,
  } = props;

  const accordionLabel = (
    <Fragment>
      {name || <FormattedMessage id="stripes-smart-components.customFields.fieldName.noSet" />}
      {' · '}
      <FormattedMessage id={`stripes-smart-components.customFields.fieldTypes.${type}`} />
      {' '}
      {required && !visible
        && <FormattedMessage id="stripes-smart-components.customFields.settings.accordion.requiredHidden" />
      }
      {required && visible
        && <FormattedMessage id="stripes-smart-components.customFields.settings.accordion.required" />
      }
      {!visible && !required
        && <FormattedMessage id="stripes-smart-components.customFields.settings.accordion.hidden" />
      }
    </Fragment>
  );

  const renderHeaderButtons = () => (
    <IconButton
      icon="trash"
      onClick={deleteCustomField}
    />
  );

  const AccordionContent = editMode
    ? editFieldsByType[type]
    : viewSectionsByType[type];

  const contentProps = editMode
    ? {
      onChange,
      values: { ...fieldData }
    }
    : { ...fieldData };

  return (
    <Accordion
      id={id}
      label={accordionLabel}
      displayWhenOpen={editMode && renderHeaderButtons()}
      displayWhenClosed={editMode && renderHeaderButtons()}
      separator={separator}
    >
      <AccordionContent {...contentProps} />
    </Accordion>
  );
};

FieldAccordion.propTypes = propTypes;

export default FieldAccordion;

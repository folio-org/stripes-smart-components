import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  IconButton,
} from '@folio/stripes-components';

import { fieldTypes } from '../../constants';

const propTypes = {
  children: PropTypes.element.isRequired,
  deleteCustomField: PropTypes.func,
  editMode: PropTypes.bool,
  fieldData: PropTypes.shape({
    name: PropTypes.string,
    required: PropTypes.bool,
    type: PropTypes.oneOf(Object.values(fieldTypes)).isRequired,
    visible: PropTypes.bool,
  }).isRequired,
  id: PropTypes.string.isRequired,
  separator: PropTypes.bool,
};

const FieldAccordion = (props) => {
  const {
    children,
    id,
    separator,
    editMode,
    deleteCustomField,
    fieldData: {
      name,
      type,
      visible,
      required,
    },
  } = props;

  const renderAccordionLabel = () => (
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

  return (
    <Accordion
      id={id}
      label={renderAccordionLabel()}
      displayWhenOpen={editMode && renderHeaderButtons()}
      displayWhenClosed={editMode && renderHeaderButtons()}
      separator={separator}
    >
      {children}
    </Accordion>
  );
};

FieldAccordion.propTypes = propTypes;

export default FieldAccordion;

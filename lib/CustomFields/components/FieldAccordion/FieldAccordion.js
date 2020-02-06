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
  formData: PropTypes.shape({
    entityType: PropTypes.string.isRequired,
    helpText: PropTypes.string,
    name: PropTypes.string,
    order: PropTypes.number,
    refId: PropTypes.string,
    required: PropTypes.bool,
    type: PropTypes.oneOf(Object.values(fieldTypes)).isRequired,
    visible: PropTypes.bool,
  }).isRequired,
  id: PropTypes.string.isRequired,
  separator: PropTypes.bool,
};

const FieldAccordion = (props) => {
  const renderAccordionLabel = () => {
    const {
      name,
      type,
      visible,
      required,
    } = props.formData;

    return (
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
  };

  const renderHeaderButtons = () => {
    const { deleteCustomField } = props;

    return (
      <Fragment>
        <IconButton
          icon="trash"
          onClick={deleteCustomField}
        />
      </Fragment>
    );
  };

  const {
    children,
    id,
    separator,
    editMode,
  } = props;

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

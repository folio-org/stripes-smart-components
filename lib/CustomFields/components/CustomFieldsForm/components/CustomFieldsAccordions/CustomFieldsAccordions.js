import React from 'react';
import PropTypes from 'prop-types';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import {
  AccordionSet,
} from '@folio/stripes-components';

import DraggableFieldAccordion from '../../../DraggableFieldAccordion';
import {
  textboxShape,
  textareaShape,
  checkboxShape,
  permissionsShape,
} from '../../../../shapes';
import { fieldTypes } from '../../../../constants';

const propTypes = {
  accordions: PropTypes.object.isRequired,
  changeFieldValue: PropTypes.func.isRequired,
  fields: PropTypes.shape({
    length: PropTypes.number.isRequired,
    map: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    value: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      values: PropTypes.oneOfType([
        textboxShape,
        textareaShape,
        checkboxShape,
      ]).isRequired,
    })).isRequired,
  }).isRequired,
  getFormState: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onToggleAccordion: PropTypes.func.isRequired,
  permissions: permissionsShape.isRequired,
};

const CustomFieldsAccordions = ({
  fields,
  permissions,
  accordions,
  onToggleAccordion,
  onDeleteClick,
  changeFieldValue,
  getFormState,
}) => {
  const getCustomFieldDefaultOptions = (fieldType, index) => {
    const props = {};
    const selectField = getFormState().values.customFields[index].values.selectField;

    if (fieldType === fieldTypes.RADIO_BUTTON_SET || fieldType === fieldTypes.SELECT) {
      props.defaultOptions = selectField.defaults;
    }

    if (fieldType === fieldTypes.MULTISELECT) {
      props.defaultOptions = selectField.defaults
        .reduce((acc, option) => {
          if (!selectField.options.values.includes(option)) {
            return acc;
          }

          return option && Array.isArray(option) ? [...acc, ...option] : [...acc, option];
        }, []);
    }

    return props;
  };

  return (
    <Droppable droppableId="custom-fields-droppable">
      {(droppableProvided) => (
        <div
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
        >
          <AccordionSet
            accordionStatus={accordions}
            onToggle={onToggleAccordion}
          >
            {fields.map((name, index) => {
              const isDragDisabled = fields.length < 2;
              const { id } = fields.value[index];
              const fieldType = fields.value[index].values.type;

              let accordionProps = {
                fieldNamePrefix: `${name}.values`,
                id,
                key: id,
                deleteCustomField: () => {
                  fields.remove(index);
                  onDeleteClick(fields.value[index], index);
                },
                isEditMode: true,
                fieldData: { ...fields.value[index].values },
                changeFieldValue,
                permissions,
                index,
                isDragDisabled,
              };

              accordionProps = { ...accordionProps, ...getCustomFieldDefaultOptions(fieldType, index) };

              return (
                <Draggable
                  draggableId={id}
                  index={index}
                  disableInteractiveElementBlocking={!accordions[id]}
                  isDragDisabled={isDragDisabled}
                >
                  {(draggableProvided, snapshot) => (
                    <DraggableFieldAccordion
                      {...accordionProps}
                      provided={draggableProvided}
                      snapshot={snapshot}
                    />
                  )}
                </Draggable>
              );
            })}
            {droppableProvided.placeholder}
          </AccordionSet>
        </div>
      )}
    </Droppable>
  );
};

CustomFieldsAccordions.propTypes = propTypes;

export default CustomFieldsAccordions;

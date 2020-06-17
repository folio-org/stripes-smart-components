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
  onDeleteClick: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
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
  onDragEnd,
}) => {
  const renderAccordions = () => {
    return fields.map((name, index) => {
      const isDragDisabled = fields.length < 2;
      const { id } = fields.value[index];

      const accordionProps = {
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
        onDragEnd,
      };

      return (
        <Draggable
          key={id}
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
    });
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
            {renderAccordions()}
            {droppableProvided.placeholder}
          </AccordionSet>
        </div>
      )}
    </Droppable>
  );
};

CustomFieldsAccordions.propTypes = propTypes;

export default CustomFieldsAccordions;

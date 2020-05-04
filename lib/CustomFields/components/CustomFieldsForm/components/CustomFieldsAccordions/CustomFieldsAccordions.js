import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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


import styles from './CustomFieldsAccordions.css';

const propTypes = {
  accordions: PropTypes.object.isRequired,
  fields: PropTypes.shape({
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
  onDragEnd,
  onDeleteClick,
}) => (
  <div className={styles.accordionsWrapper}>
    <DragDropContext onDragEnd={onDragEnd}>
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

                return (
                  <Draggable
                    draggableId={id}
                    index={index}
                    disableInteractiveElementBlocking={!accordions[id]}
                    isDragDisabled={isDragDisabled}
                  >
                    {(draggableProvided, snapshot) => (
                      <DraggableFieldAccordion
                        fieldNamePrefix={`${name}.values`}
                        id={id}
                        key={id}
                        deleteCustomField={() => {
                          fields.remove(index);
                          onDeleteClick(fields.value[index], index);
                        }}
                        isEditMode
                        fieldData={{ ...fields.value[index].values }}
                        permissions={permissions}
                        index={index}
                        provided={draggableProvided}
                        snapshot={snapshot}
                        isDragDisabled={isDragDisabled}
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
    </DragDropContext>
  </div>
);

CustomFieldsAccordions.propTypes = propTypes;

export default CustomFieldsAccordions;

import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  AccordionSet,
} from '@folio/stripes-components';

import DraggableFieldAccordion from '../../../DraggableFieldAccordion';

import styles from './CustomFieldsAccordions.css';

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
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
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
                    {(provided, snapshot) => (
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
                        provided={provided}
                        snapshot={snapshot}
                        isDragDisabled={isDragDisabled}
                      />
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </AccordionSet>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  </div>
);

export default CustomFieldsAccordions;

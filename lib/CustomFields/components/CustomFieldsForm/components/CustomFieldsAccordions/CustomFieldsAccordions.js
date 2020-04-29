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
        {(provided, droppableSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <AccordionSet
              accordionStatus={accordions}
              onToggle={onToggleAccordion}
            >
              {fields.map((name, index) => (
                <Draggable
                  draggableId={fields.value[index].id}
                  index={index}
                  disableInteractiveElementBlocking
                >
                  {(provided, draggableSnapshot) => (
                    <DraggableFieldAccordion
                      fieldNamePrefix={`${name}.values`}
                      id={fields.value[index].id}
                      key={fields.value[index].id}
                      deleteCustomField={() => {
                        fields.remove(index);
                        onDeleteClick(fields.value[index], index);
                      }}
                      isEditMode
                      fieldData={{ ...fields.value[index].values }}
                      permissions={permissions}
                      index={index}
                      provided={provided}
                      snapshot={draggableSnapshot}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </AccordionSet>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  </div>
)

export default CustomFieldsAccordions;

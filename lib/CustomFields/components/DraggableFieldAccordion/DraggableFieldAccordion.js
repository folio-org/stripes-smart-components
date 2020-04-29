import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import className from 'classnames';

import { FieldAccordion } from '../'

import styles from './DraggableFieldAccordion.css';

const DraggableFieldAccordion = (props) => {
  const { provided, snapshot, ...rest } = props;

  const usePortal = snapshot.isDragging;

  const Accordion = (
    <div
      className={className(
        styles.FieldAccordionDraggableWrapper,
        { [`${styles['FieldAccordionDraggableWrapper--dragging']}`]: snapshot.isDragging }
      )}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <FieldAccordion
        {...rest}
        dragHandleProps={provided.dragHandleProps}
      />
    </div>
  );

  if (!usePortal) {
    return Accordion;
  }

  const container = document.getElementById('ModuleContainer');
  return ReactDOM.createPortal(Accordion, container);
}

export default DraggableFieldAccordion;

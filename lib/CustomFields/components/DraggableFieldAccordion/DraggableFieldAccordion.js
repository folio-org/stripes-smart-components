import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { FieldAccordion } from '../'

import styles from './DraggableFieldAccordion.css';

const DraggableFieldAccordion = (props) => {
  const { provided, snapshot, ...rest } = props;

  const usePortal = snapshot.isDragging;

  const Accordion = (
    <div
      className={styles.FieldAccordionDraggableWrapper}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <FieldAccordion {...rest} />
    </div>
  );

  if (!usePortal) {
    return Accordion;
  }

  const container = document.getElementById('ModuleContainer');
  return ReactDOM.createPortal(Accordion, container);
}

export default DraggableFieldAccordion;

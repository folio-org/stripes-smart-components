import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import className from 'classnames';

import { FieldAccordion } from '..';

import styles from './DraggableFieldAccordion.css';

const propTypes = {
  provided: PropTypes.shape({
    draggableProps: PropTypes.object.isRequired,
    dragHandleProps: PropTypes.object.isRequired,
    innerRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        current: PropTypes.instanceOf(Element),
      }),
    ]).isRequired,
  }).isRequired,
  snapshot: PropTypes.shape({
    isDragging: PropTypes.bool.isRequired,
  }).isRequired,
};

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
      // eslint-disable-next-line react/refs -- draggableProps come from the drag-and-drop library and are only spread onto the element, not read during render
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- drag handle props are spread onto a non-button element; a native button would change markup and styling
      role="button"
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
};

DraggableFieldAccordion.propTypes = propTypes;

export default DraggableFieldAccordion;

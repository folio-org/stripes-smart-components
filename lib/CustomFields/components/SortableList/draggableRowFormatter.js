import React from 'react';
import PropTypes from 'prop-types';
import {
  Draggable
} from 'react-beautiful-dnd';

import DraggableRow from './DraggableRow';

export default function draggableRowFormatter(props) {
  const {
    rowIndex,
    rowData,
    rowProps: {
      isRowDraggable,
      rowsCount,
      isDraggingOver,
      placeholder,
    },
  } = props;

  return (
    <Draggable
      key={`row-${rowIndex}`}
      draggableId={`draggable-${rowIndex}`}
      index={rowIndex}
      isDragDisabled={!isRowDraggable(rowData, rowIndex)}
    >
      {(provided, snapshot) => (
        <>
          <DraggableRow
            provided={provided}
            snapshot={snapshot}
            {...props}
          />
          {
            isDraggingOver && rowsCount === rowIndex + 1? placeholder : null
          }
        </>
      )}
    </Draggable>
  );
}

draggableRowFormatter.propTypes = {
  rowIndex: PropTypes.number,
  rowData: PropTypes.object,
  rowProps: PropTypes.shape({
    isRowDraggable: PropTypes.bool
  }),
};

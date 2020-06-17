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
      isSingleSelect,
    },
  } = props;

  const shouldRenderPlaceholder = isDraggingOver && (rowsCount === rowIndex + 1);
  console.log(rowsCount, rowIndex);
  console.log(shouldRenderPlaceholder);

  return (
    <Draggable
      key={rowData.id}
      draggableId={rowData.id}
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
            shouldRenderPlaceholder ? placeholder : null
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

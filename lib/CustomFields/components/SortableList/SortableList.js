import { uniqueId } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { MultiColumnList } from '@folio/stripes/components';
import {
  DragDropContext,
  Droppable,
} from 'react-beautiful-dnd';

import draggableRowFormatter from './draggableRowFormatter';

export default function SortableList(props) {
  const {
    droppableId,
    onDragEnd,
    rowFormatter,
    isRowDraggable,
    rowProps,
  } = props;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <MultiColumnList
              {...props}
              rowFormatter={rowFormatter}
              rowProps={{
                ...rowProps,
                isRowDraggable,
                isDraggingOver: snapshot.isDraggingOver,
                placeholder: provided.placeholder,
              }}
            />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

SortableList.defaultProps = {
  droppableId: uniqueId('droppable'),
  rowFormatter: draggableRowFormatter,
  isRowDraggable: () => true,
};

SortableList.propTypes = {
  droppableId: PropTypes.string,
  onDragEnd: PropTypes.func,
  rowFormatter: PropTypes.func,
  isRowDraggable: PropTypes.func,
  rowProps: PropTypes.object,
};

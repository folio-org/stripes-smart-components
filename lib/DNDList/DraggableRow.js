import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import defaultRowFormatter from '@folio/stripes-components/lib/MultiColumnList/defaultRowFormatter';

import css from './DraggableRow.css';

const getItemStyle = (draggableStyle) => {
  return {
    userSelect: 'none',
    ...draggableStyle,
  };
};

const propTypes = {
  provided: PropTypes.object,
  rowClass: PropTypes.string,
  rowProps: PropTypes.object,
  snapshot: PropTypes.object,
};

const DraggableRow = ({
  snapshot,
  provided,
  rowClass,
  rowProps,
  ...rest
}) => {
  const usePortal = snapshot.isDragging;

  const Row = defaultRowFormatter({
    ...rest,
    rowClass: classNames(rowClass, { [css.DraggableRow]: usePortal }),
    'data-test-draggable-row': true,
    rowProps: {
      ...rowProps,
      ref: provided.innerRef,
      ...provided.dragHandleProps,
      ...provided.draggableProps,
      role: 'row',
      style: getItemStyle(provided.draggableProps.style),
    },
  });

  if (!usePortal) {
    return Row;
  }

  const container = document.getElementById('ModuleContainer');

  return ReactDOM.createPortal(Row, container);
};

DraggableRow.propTypes = propTypes;

export default DraggableRow;

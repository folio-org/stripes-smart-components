import React from 'react';
import PropTypes from 'prop-types';
import css from './EditableList.css';

const ItemView = ({ cells, rowIndex }) => (
  <div className={css.editListRow} role="row" aria-rowindex={rowIndex + 2}>
    {cells}
  </div>
);

ItemView.propTypes = {
  cells: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowIndex: PropTypes.number.isRequired,
};

export default ItemView;

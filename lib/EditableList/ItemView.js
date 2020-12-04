import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import css from './EditableList.css';

const ItemView = ({ cells, rowIndex }) => (
  <div
    className={classnames(
      css.editListRow,
      { [css.isOdd]: !(rowIndex % 2) }
    )}
    aria-rowindex={rowIndex + 2}
  >
    {cells}
  </div>
);

ItemView.propTypes = {
  cells: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowIndex: PropTypes.number.isRequired,
};

export default ItemView;

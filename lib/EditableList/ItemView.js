import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import css from './EditableList.css';

const ItemView = ({ cells, rowClass, rowIndex }) => (
  <div
    className={classnames(
      css.editListRow,
      { [css.isOdd]: !(rowIndex % 2) },
      rowClass,
    )}
    data-row-inner={rowIndex + 2}
  >
    {cells}
  </div>
);

ItemView.propTypes = {
  cells: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowClass: PropTypes.string,
  rowIndex: PropTypes.number.isRequired,
};

export default ItemView;

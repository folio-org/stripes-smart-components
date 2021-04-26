/**
 * ColumnManager
 */

import React, { useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';

import useColumnManager from './useColumnManager';
import ColumnManagerMenu from './ColumnManagerMenu';

const ColumnManager = ({ id, columnMapping, children, excludeKeys }) => {
  const prefixId = `column-manager-${id}`;

  const nonToggleableColumns = useRef(excludeKeys).current;
  const { visibleColumns, toggleColumn } = useColumnManager(prefixId, columnMapping);

  /**
   * Render columns menu section
   *
   * This is passed down as a render-prop and provides
   * an easy way for developers to render a column menu section inside e.g. a dropdown
   */
  const renderColumnsMenu = useMemo(() => (
    <ColumnManagerMenu
      prefix={prefixId}
      columnMapping={columnMapping}
      visibleColumns={visibleColumns}
      excludeColumns={nonToggleableColumns}
      toggleColumn={toggleColumn}
    />
  ), [prefixId, columnMapping, visibleColumns, nonToggleableColumns, toggleColumn]);

  const renderProps = {
    visibleColumns,
    renderColumnsMenu,
    toggleColumn
  };

  return children(renderProps);
};

ColumnManager.defaultProps = {
  columnMapping: {},
  excludeKeys: [],
};

ColumnManager.propTypes = {
  children: PropTypes.func.isRequired,
  columnMapping: PropTypes.object.isRequired,
  excludeKeys: PropTypes.arrayOf(PropTypes.string),
  id: PropTypes.string.isRequired,
};

export default memo(ColumnManager);

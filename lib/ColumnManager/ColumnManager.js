/**
 * ColumnManager
 */

import React, { useState, useCallback, useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Checkbox, MenuSection } from '@folio/stripes-components';

// We use session storage for now, but could easily be changed to localStorage
const STORAGE = sessionStorage;

const ColumnManager = ({ id, columnMapping, children, excludeKeys }) => {
  const intl = useIntl();
  const nonToggleableColumns = useRef(excludeKeys).current;
  const prefixId = `column-manager-${id}`;
  const storageKey = `${prefixId}-storage`;

  // The column mapping object determines the default visible columns and order
  const defaultColumnKeys = typeof columnMapping === 'object' ? Object.keys(columnMapping) : [];

  const initialVisibleColumns = useMemo(() => {
    const stored = STORAGE.getItem(storageKey);
    return stored ? JSON.parse(stored) : defaultColumnKeys;
  }, [storageKey, defaultColumnKeys]);

  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);

  const orderedVisibleColumns = useMemo(() => {
    const visible = new Set(visibleColumns);
    return defaultColumnKeys.filter(key => visible.has(key));
  }, [defaultColumnKeys, visibleColumns]);

  /**
   * Toggle column visibility
   */
  const toggleColumn = useCallback(key => {
    setVisibleColumns(currVisibleColumns => {
      const nextVisibleColumns = currVisibleColumns.includes(key) ?
        currVisibleColumns.filter(k => key !== k) :
        [...currVisibleColumns, key];

      STORAGE.setItem(storageKey, JSON.stringify(nextVisibleColumns));

      return nextVisibleColumns;
    });
  }, [storageKey]);

  /**
   * Render columns menu section
   *
   * This is passed down as a render-prop and provides
   * an easy way for developers to render a column menu section inside e.g. a dropdown
   */
  const renderColumnsMenu = useMemo(() => (
    <MenuSection label={intl.formatMessage({ id: 'ui-users.showColumns' })} id={`${prefixId}-columns-menu-section`}>
      {defaultColumnKeys
        .filter(key => !nonToggleableColumns.includes(key))
        .map(key => (
          <Checkbox
            key={key}
            name={key}
            label={columnMapping[key]}
            id={`${prefixId}-column-checkbox-${key}`}
            checked={visibleColumns.includes(key)}
            value={key}
            onChange={() => toggleColumn(key)}
          />
      ))}
    </MenuSection>
  ), [columnMapping, visibleColumns, defaultColumnKeys, nonToggleableColumns, intl, prefixId, toggleColumn]);

  const renderProps = {
    visibleColumns: orderedVisibleColumns,
    renderColumnsMenu
  };

  return children(renderProps);
};

ColumnManager.defaultProps = {
  excludeKeys: [],
}

ColumnManager.propTypes = {
  id: PropTypes.string.isRequired,
  columnMapping: PropTypes.object,
  children: PropTypes.func,
  excludeKeys: PropTypes.arrayOf(PropTypes.string),
}

export default memo(ColumnManager);

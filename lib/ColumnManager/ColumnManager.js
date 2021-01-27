/**
 * ColumnManager
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import { useIntl } from 'react-intl';
import { Checkbox, MenuSection } from '@folio/stripes-components';

const ColumnManager = ({ id, columnMapping, children }) => {
  const prefixId = `column-manager-${id}`;
  const storageKey = `${prefixId}-storage`;
  const intl = useIntl();

  const defaultColumnKeys = typeof columnMapping === 'object' ? Object.keys(columnMapping) : [];
  const initialVisibleColumns = useMemo(() => {
    const stored = sessionStorage.getItem(storageKey);
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

      sessionStorage.setItem(storageKey, JSON.stringify(nextVisibleColumns));

      return nextVisibleColumns;
    });
  }, [storageKey]);

  /**
   * Render columns menu section
   *
   * Will be passed down as a render-prop and
   * provides an easy way for developers
   * to render a column selection dropdown
   */
  const renderColumnsMenu = useMemo(() => (
    <MenuSection label={intl.formatMessage({ id: 'ui-users.showColumns' })} id={`${prefixId}-columns-menu-section`}>
      {defaultColumnKeys.map(key => (
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
  ), [columnMapping, visibleColumns, defaultColumnKeys, intl, prefixId, toggleColumn]);

  const renderProps = {
    visibleColumns: orderedVisibleColumns,
    renderColumnsMenu
  };

  return children(renderProps);
};

export default memo(ColumnManager);

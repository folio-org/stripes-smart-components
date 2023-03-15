import { useMemo, useState, useCallback } from 'react';

const useColumnManager = (prefix, columnMapping, persist) => {
  const STORAGE = persist ? localStorage : sessionStorage;
  const storageKey = `${prefix}-storage`;

  // The column mapping object determines the default visible columns and order
  const defaultColumnKeys = useMemo(() => Object.keys(columnMapping), [columnMapping]);

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const stored = STORAGE.getItem(storageKey);

    return stored ? JSON.parse(stored) : defaultColumnKeys;
  });

  const orderedVisibleColumns = useMemo(() => {
    const visibleColumnsSet = new Set(visibleColumns);

    return defaultColumnKeys.filter(key => visibleColumnsSet.has(key));
  }, [defaultColumnKeys, visibleColumns]);

  /**
   * Toggle column visibility
   */
  const toggleColumn = useCallback(key => {
    setVisibleColumns(currVisibleColumns => {
      const nextVisibleColumns = currVisibleColumns.includes(key)
        ? currVisibleColumns.filter(k => key !== k)
        : [...currVisibleColumns, key];

      STORAGE.setItem(storageKey, JSON.stringify(nextVisibleColumns));

      return nextVisibleColumns;
    });
  }, [STORAGE, storageKey]);

  return {
    visibleColumns: orderedVisibleColumns,
    toggleColumn,
  };
};

export default useColumnManager;

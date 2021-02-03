/**
 * ColumnManager
 */

import React, { useState, useCallback, useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Checkbox, MenuSection } from '@folio/stripes-components';

const STORAGE = sessionStorage;

const ColumnManager = ({ id, columnMapping, children, excludeKeys }) => {
  const intl = useIntl();
  const nonToggleableColumns = useRef(excludeKeys).current;
  const prefixId = `column-manager-${id}`;
  const storageKey = `${prefixId}-storage`;

  // The column mapping object determines the default visible columns and order
  const defaultColumnKeys = Object.keys(columnMapping);

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
  const renderColumnsMenu = useMemo(() => {
    const nonToggleableSet = new Set(nonToggleableColumns);

    return (
      <MenuSection
        data-test-column-manager-menu
        label={intl.formatMessage({ id: 'stripes-smart-components.columnManager.showColumns' })}
        id={`${prefixId}-columns-menu-section`}
      >
        {
          defaultColumnKeys
            .filter(key => !nonToggleableSet.has(key))
            .map(key => (
              <Checkbox
                data-test-column-manager-menu-checkbox={key}
                key={key}
                name={key}
                label={columnMapping[key]}
                id={`${prefixId}-column-checkbox-${key}`}
                checked={visibleColumns.includes(key)}
                value={key}
                onChange={() => toggleColumn(key)}
              />
            ))
        }
      </MenuSection>
    );
  }, [columnMapping, visibleColumns, defaultColumnKeys, nonToggleableColumns, intl, prefixId, toggleColumn]);

  const renderProps = {
    visibleColumns: orderedVisibleColumns,
    renderColumnsMenu,
    toggleColumn
  };

  return children(renderProps);
};

ColumnManager.defaultProps = {
  excludeKeys: [],
};

ColumnManager.propTypes = {
  children: PropTypes.func.isRequired,
  columnMapping: PropTypes.object.isRequired,
  excludeKeys: PropTypes.arrayOf(PropTypes.string),
  id: PropTypes.string.isRequired,
};

export default memo(ColumnManager);

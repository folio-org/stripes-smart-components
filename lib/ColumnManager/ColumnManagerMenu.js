import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { Checkbox, MenuSection } from '@folio/stripes-components';

const ColumnManagerMenu = ({
  prefix,
  columnMapping,
  visibleColumns = [],
  excludeColumns = [],
  toggleColumn,
}) => {
  const intl = useIntl();

  const renderMenuItems = () => {
    const nonToggleableSet = new Set(excludeColumns);

    return Object.keys(columnMapping)
      .filter(key => !nonToggleableSet.has(key))
      .map(key => (
        <Checkbox
          data-test-column-manager-checkbox={key}
          key={key}
          name={key}
          label={columnMapping[key]}
          id={`${prefix}-column-checkbox-${key}`}
          checked={visibleColumns.includes(key)}
          value={key}
          onChange={() => toggleColumn(key)}
        />
      ));
  };

  return (
    <MenuSection
      data-test-column-manager-menu
      label={intl.formatMessage({ id: 'stripes-smart-components.columnManager.showColumns' })}
      id={`${prefix}-columns-menu-section`}
    >
      {renderMenuItems()}
    </MenuSection>
  );
};

ColumnManagerMenu.propTypes = {
  columnMapping: PropTypes.object.isRequired,
  excludeColumns: PropTypes.arrayOf(PropTypes.string),
  prefix: PropTypes.string.isRequired,
  toggleColumn: PropTypes.func.isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
};

export default ColumnManagerMenu;

import React from 'react';
import PropTypes from 'prop-types';

import { FilterGroups } from '@folio/stripes-components';

const Filters = ({
  activeFilters,
  onChangeHandlers: { checkbox, clearGroup },
  config,
}) => {
  const groupFilters = {};

  activeFilters.string.split(',').forEach(m => { groupFilters[m] = true; });

  return (
    <FilterGroups
      config={config}
      filters={groupFilters}
      onChangeFilter={checkbox}
      onClearFilter={clearGroup}
    />
  );
};

Filters.propTypes = {
  activeFilters: PropTypes.object,
  config: PropTypes.arrayOf(PropTypes.object),
  onChangeHandlers: PropTypes.object.isRequired,
};

Filters.defaultProps = {
  activeFilters: {},
};

export default Filters;

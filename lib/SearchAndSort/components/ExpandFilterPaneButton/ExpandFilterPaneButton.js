/**
 * CollapseFilterPaneButton
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { PaneHeaderIconButton } from '@folio/stripes-components';

const CollapseFilterPaneButton = ({ onClick, filterCount }) => (
  <FormattedMessage
    id="stripes-smart-components.numberOfFilters"
    values={{ count: filterCount }}
  >
    {appliedFiltersMessage => (
      <FormattedMessage id="stripes-smart-components.showSearchPane">
        {showSearchPaneMessage => (
          <PaneHeaderIconButton
            icon="caret-right"
            iconSize="medium"
            ariaLabel={`${showSearchPaneMessage} \n\n${appliedFiltersMessage}`}
            onClick={onClick}
            badgeCount={filterCount || undefined}
            data-test-expand-filter-pane-button
          />
        )}
      </FormattedMessage>
    )}
  </FormattedMessage>
);

CollapseFilterPaneButton.propTypes = {
  filterCount: PropTypes.number,
  onClick: PropTypes.func,
};

export default CollapseFilterPaneButton;

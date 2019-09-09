/**
 * CollapseFilterPaneButton
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { PaneHeaderIconButton, Tooltip } from '@folio/stripes-components';

const CollapseFilterPaneButton = ({ onClick, filterCount }) => (
  <FormattedMessage
    id="stripes-smart-components.numberOfFilters"
    values={{ count: filterCount }}
  >
    {appliedFiltersMessage => (
      <FormattedMessage id="stripes-smart-components.showSearchPane">
        {showSearchPaneMessage => (
          <Tooltip
            text={showSearchPaneMessage}
            sub={filterCount ? appliedFiltersMessage : null}
            id="expand-filter-pane-button-tooltip"
          >
            {({ ref, ariaIds }) => (
              <PaneHeaderIconButton
                ref={ref}
                icon="caret-right"
                iconSize="medium"
                onClick={onClick}
                badgeCount={filterCount || undefined}
                aria-labelledby={ariaIds.text}
                aria-describedby={ariaIds.sub}
                data-test-expand-filter-pane-button
              />
            )}
          </Tooltip>
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

/**
 * CollapseFilterPaneButton
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { PaneHeaderIconButton, Tooltip } from '@folio/stripes-components';
import { restorePaneToggleFocus } from '../../../utils';

const CollapseFilterPaneButton = ({ onClick, filterCount }) => {
  const handleClick = useCallback((event) => {
    onClick?.(event);
    restorePaneToggleFocus();
  }, [onClick]);

  return (
    <Tooltip
      text={<FormattedMessage id="stripes-smart-components.showSearchPane" />}
      sub={filterCount
        ? (
          <FormattedMessage
            id="stripes-smart-components.numberOfFilters"
            values={{ count: filterCount }}
          />
        )
        : null
      }
      id="expand-filter-pane-button-tooltip"
    >
      {({ ref, ariaIds }) => (
        <PaneHeaderIconButton
          ref={ref}
          icon="caret-right"
          iconSize="medium"
          onClick={handleClick}
          badgeCount={filterCount || undefined}
          aria-labelledby={ariaIds.text}
          aria-describedby={ariaIds.sub}
          data-test-expand-filter-pane-button
        />
      )}
    </Tooltip>
  );
};

CollapseFilterPaneButton.propTypes = {
  filterCount: PropTypes.number,
  onClick: PropTypes.func,
};

export default CollapseFilterPaneButton;

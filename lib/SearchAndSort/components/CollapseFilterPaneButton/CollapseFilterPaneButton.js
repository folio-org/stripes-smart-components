/**
 * CollapseFilterPaneButton
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { PaneHeaderIconButton, Tooltip } from '@folio/stripes-components';

const CollapseFilterPaneButton = ({ onClick }) => (
  <FormattedMessage id="stripes-smart-components.hideSearchPane">
    {hideSearchPaneMessage => (
      <Tooltip
        text={hideSearchPaneMessage}
        id="collapse-filter-pane-button-tooltip"
      >
        {({ ref, ariaIds }) => (
          <PaneHeaderIconButton
            ref={ref}
            aria-labelledby={ariaIds.text}
            icon="caret-left"
            iconSize="medium"
            onClick={onClick}
            data-test-collapse-filter-pane-button
          />
        )}
      </Tooltip>
    )}
  </FormattedMessage>
);

CollapseFilterPaneButton.propTypes = {
  onClick: PropTypes.func,
};

export default CollapseFilterPaneButton;

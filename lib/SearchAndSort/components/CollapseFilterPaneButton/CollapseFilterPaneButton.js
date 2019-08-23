/**
 * CollapseFilterPaneButton
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { PaneHeaderIconButton } from '@folio/stripes-components';

const CollapseFilterPaneButton = ({ onClick }) => (
  <FormattedMessage id="stripes-smart-components.hideSearchPane">
    {hideSearchPaneMessage => (
      <PaneHeaderIconButton
        ariaLabel={hideSearchPaneMessage}
        icon="caret-left"
        iconSize="medium"
        onClick={onClick}
        data-test-collapse-filter-pane-button
      />
    )}
  </FormattedMessage>
);

CollapseFilterPaneButton.propTypes = {
  onClick: PropTypes.func,
};

export default CollapseFilterPaneButton;

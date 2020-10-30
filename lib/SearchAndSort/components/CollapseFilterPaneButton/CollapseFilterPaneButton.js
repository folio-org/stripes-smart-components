/**
 * CollapseFilterPaneButton
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { PaneHeaderIconButton, Tooltip } from '@folio/stripes-components';
import css from './CollapseFilterPaneButton.css';

const CollapseFilterPaneButton = ({ onClick }) => {
  const intl = useIntl();

  return (
    <Tooltip
      text={intl.formatMessage({ id: 'stripes-smart-components.hideSearchPane' })}
      id="collapse-filter-pane-button-tooltip"
    >
      {({ ref, ariaIds }) => (
        <PaneHeaderIconButton
          ref={ref}
          aria-labelledby={ariaIds.text}
          icon="caret-left"
          iconSize="medium"
          onClick={onClick}
          className={css.button}
          data-test-collapse-filter-pane-button
        />
      )}
    </Tooltip>
  );
};

CollapseFilterPaneButton.propTypes = {
  onClick: PropTypes.func,
};

export default CollapseFilterPaneButton;

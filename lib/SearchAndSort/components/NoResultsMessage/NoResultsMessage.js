/**
 * No Results Message
 *
 * Renders a no results message based on a users inputs
 */

import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@folio/stripes-components/lib/Icon';
import Button from '@folio/stripes-components/lib/Button';
import css from './NoResultsMessage.css';

const NoResultsMessage = ({ source, searchTerm, filterPaneIsVisible, toggleFilterPane, notLoadedMessage }) => {
  const failure = source.failure();

  let icon = 'search';
  let label = `No results found for "${searchTerm}". Please check your spelling and filters.`;

  // No search term entered or filters selected
  if (!source.loaded()) {
    icon = filterPaneIsVisible ? 'left-arrow' : null;
    label = notLoadedMessage || 'Choose a filter or enter search query to show results';
  }

  // Filters selected and no search term but no results
  if (source.loaded() && !searchTerm) {
    icon = 'search';
    label = 'No results found. Please check your filters.';
  }

  // Loading results
  if (source.pending()) {
    icon = 'spinner-ellipsis';
    label = 'Loading...';
  }

  // Request failure
  if (failure) {
    icon = 'validation-error';
    label = source.failureMessage();
  }

  return (
    <div className={css.noResultsMessage}>
      <div className={css.noResultsMessageLabelWrap}>
        {icon && <Icon iconRootClass={css.noResultsMessageIcon} icon={icon} />}
        <span className={css.noResultsMessageLabel}>{label}</span>
      </div>
      {/* If the filter pane is closed we show a button that toggles filter pane */}
      {!filterPaneIsVisible && <Button marginBottom0 buttonClass={css.noResultsMessageButton} onClick={toggleFilterPane}>Show filters</Button>}
    </div>
  );
};

NoResultsMessage.propTypes = {
  source: PropTypes.object.isRequired,
  searchTerm: PropTypes.string.isRequired,
  filterPaneIsVisible: PropTypes.bool.isRequired,
  toggleFilterPane: PropTypes.func.isRequired,
  notLoadedMessage: PropTypes.string,
};

export default NoResultsMessage;

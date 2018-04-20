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

const NoResultsMessage = ({ analyzer, searchTerm, filterPaneIsVisible, toggleFilterPane }) => {
  const failure = analyzer.failure();

  let icon = 'search';
  let label = `No results found for "${searchTerm}". Please check your spelling and filters.`;

  // No search term entered or filters selected
  if (!analyzer.loaded()) {
    icon = filterPaneIsVisible ? 'left-arrow' : null;
    label = 'Choose a filter or enter search query to show results';
  }

  // Filters selected and no search term but no results
  if (analyzer.loaded() && !searchTerm) {
    icon = 'search';
    label = 'No results found. Please check your filters.';
  }

  // Loading results
  if (analyzer.pending()) {
    icon = 'spinner-ellipsis';
    label = 'Loading...';
  }

  // Request failure
  if (failure) {
    icon = 'validation-error'; 

    // XXX clearly this branching should be in the analyzer
    // object. But we'll need to design an API for how that looks --
    // most likely, just a failureMessage() or similar. And to do
    // that, we need to better understand what the POs want displayed
    // when an error occurs.
    if (failure.httpStatus !== undefined) {
      // stripes-connect failure object has: dataKey, httpStatus, message, module, resource, throwErrors
      label = `Error ${failure.httpStatus}`;
    } else {
      // react-apollo failure object has: extraInfo, graphQLErrors, message, networkError, stack
      label = `Error: ${failure.message}`;
    }
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
  analyzer: PropTypes.object.isRequired,
  searchTerm: PropTypes.string.isRequired,
  filterPaneIsVisible: PropTypes.bool.isRequired,
  toggleFilterPane: PropTypes.func.isRequired,
};

export default NoResultsMessage;

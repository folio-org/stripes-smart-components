/**
 * No Results Message
 *
 * Renders a no results message based on a users inputs
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button, Icon } from '@folio/stripes-components';
import css from './NoResultsMessage.css';

const NoResultsMessage = ({ source, searchTerm, filterPaneIsVisible, toggleFilterPane, notLoadedMessage }) => {
  const failure = source.failure();

  let icon = 'search';
  let label = <FormattedMessage id="stripes-smart-components.sas.noResults.default" values={{ searchTerm }} />;

  // No search term entered or filters selected
  if (!source.loaded()) {
    icon = filterPaneIsVisible ? 'arrow-left' : null;
    label = notLoadedMessage || <FormattedMessage id="stripes-smart-components.sas.noResults.noTerms" />;
  }

  // Filters selected and no search term but no results
  if (source.loaded() && !searchTerm) {
    icon = 'search';
    label = <FormattedMessage id="stripes-smart-components.sas.noResults.noResults" />;
  }

  // Loading results
  if (source.pending()) {
    icon = 'spinner-ellipsis';
    label = <FormattedMessage id="stripes-smart-components.sas.noResults.loading" />;
  }

  // Request failure
  if (failure) {
    icon = 'exclamation-circle';
    label = source.failureMessage();
  }

  return (
    <div className={css.noResultsMessage}>
      <div className={css.noResultsMessageLabelWrap}>
        {icon && <Icon iconRootClass={css.noResultsMessageIcon} icon={icon} />}
        <span className={css.noResultsMessageLabel}>{label}</span>
      </div>
      {/* If the filter pane is closed we show a button that toggles filter pane */}
      {!filterPaneIsVisible && (
        <Button marginBottom0 buttonClass={css.noResultsMessageButton} onClick={toggleFilterPane}>Show filters</Button>
      )}
    </div>
  );
};

NoResultsMessage.propTypes = {
  filterPaneIsVisible: PropTypes.bool.isRequired,
  notLoadedMessage: PropTypes.string,
  searchTerm: PropTypes.string.isRequired,
  source: PropTypes.object.isRequired,
  toggleFilterPane: PropTypes.func.isRequired,
};

export default NoResultsMessage;

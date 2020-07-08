import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Button } from '@folio/stripes-components';

import css from './AddOptionButton.css';

const propTypes = {
  onClick: PropTypes.func.isRequired,
  optionsToAddLeft: PropTypes.number,
};

const defaultProps = {
  optionsToAddLeft: null,
};

const AddOptionButton = ({
  onClick,
  optionsToAddLeft,
}) => (
  <>
    {optionsToAddLeft !== null && (
      <span className={css.optionsLeftMessage}>
        <FormattedMessage
          id="stripes-smart-components.customFields.options.left"
          values={{
            count: optionsToAddLeft
          }}
        />
      </span>

    )}
    <Button
      buttonClass={css.addOptionButton}
      onClick={onClick}
      data-test-custom-fields-add-option-button
    >
      <FormattedMessage id="stripes-smart-components.customFields.addOption" />
    </Button>
  </>
);

AddOptionButton.propTypes = propTypes;
AddOptionButton.defaultProps = defaultProps;

export default AddOptionButton;

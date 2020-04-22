import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Button } from '@folio/stripes-components';

import css from './AddOptionButton.css';

const propTypes = {
  onClick: PropTypes.func.isRequired,
};

const AddOptionButton = ({ onClick }) => (
  <Button
    buttonClass={css.addOptionButton}
    onClick={onClick}
  >
    <FormattedMessage id="stripes-smart-components.customFields.addOption" />
  </Button>
);

AddOptionButton.propTypes = propTypes;

export default AddOptionButton;

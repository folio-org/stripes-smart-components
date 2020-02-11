import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Dropdown,
  DropdownMenu,
  Button,
} from '@folio/stripes-components';

import styles from './AddButton.css';

const propTypes = {
  onAdd: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.element.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
};

const AddButton = ({ onAdd, options }) => (
  <Dropdown
    className={styles.dropdown}
    label={<FormattedMessage id="stripes-smart-components.customFields.addCustomField" />}
    buttonProps={{
      buttonClass: styles.toggleButton
    }}
    renderMenu={({ onToggle }) => (
      <DropdownMenu role="menu">
        {options.map(option => (
          <Button
            key={option.value}
            buttonStyle="dropdownItem"
            role="menuitem"
            onClick={() => {
              onToggle();
              onAdd(option.value);
            }}
          >
            {option.label}
          </Button>
        ))}
      </DropdownMenu>
    )}
  />
);

AddButton.propTypes = propTypes;

export default AddButton;

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
  handleAdd: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    labelElement: PropTypes.element.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
};

const AddButton = ({ handleAdd, options }) => (
  <Dropdown
    data-test-add-custom-field-dropdown
    className={styles.dropdown}
    label={<FormattedMessage id="stripes-smart-components.customFields.addCustomField" />}
    buttonProps={{
      buttonClass: styles.toggleButton
    }}
    renderMenu={({ onToggle }) => (
      <DropdownMenu role="menu">
        {options.map(option => (
          <Button
            data-test-add-custom-field-button={option.value}
            key={option.value}
            buttonStyle="dropdownItem"
            role="menuitem"
            onClick={() => {
              onToggle();
              handleAdd(option.value);
            }}
          >
            {option.labelElement}
          </Button>
        ))}
      </DropdownMenu>
    )}
  />
);

AddButton.propTypes = propTypes;

export default AddButton;

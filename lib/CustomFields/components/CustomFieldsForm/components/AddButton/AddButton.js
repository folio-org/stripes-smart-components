import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Dropdown,
  DropdownMenu,
  Button,
  DropdownButton,
} from '@folio/stripes-components';

import styles from './AddButton.css';

const propTypes = {
  onAdd: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.element.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
};

const AddButton = ({ onAdd, options }) => {
  const renderTrigger = ({ triggerRef, onToggle, keyHandler, ariaProps }) => (
    <DropdownButton
      ref={triggerRef}
      onClick={onToggle}
      onKeyDown={keyHandler}
      buttonClass={styles.toggleButton}
      {...ariaProps}
    >
      <FormattedMessage id="stripes-smart-components.customFields.addCustomField" />
    </DropdownButton>
  );

  return (
    <Dropdown
      className={styles.dropdown}
      renderTrigger={renderTrigger}
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
};

AddButton.propTypes = propTypes;

export default AddButton;

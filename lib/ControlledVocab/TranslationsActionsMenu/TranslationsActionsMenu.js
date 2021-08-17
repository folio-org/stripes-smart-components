/* eslint-disable react/sort-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownMenu,
  Button,
  Icon,
  NavListSection,
  NavListItem,
  NavList
} from '@folio/stripes-components';
import { FormattedMessage } from 'react-intl';
import { IfPermission, stripesConnect } from '@folio/stripes-core';
import CreateNewKeysModal from './CreateNewKeysModal';

const propTypes = {
  appName: PropTypes.string.isRequired,
  tableName: PropTypes.string.isRequired,
  contentData: PropTypes.arrayOf(PropTypes.object).isRequired,
  translatableFields: PropTypes.arrayOf(PropTypes.string),
  onSaveTranslations: PropTypes.func.isRequired
};

const TranslationsActionsMenu = ({
  contentData,
  onSaveTranslations
}) => {
  const [dropdownOpen, setdropdownOpen] = useState(false);
  const [openNewKeysModal, setOpenNewKeysModal] = useState(false);

  const toggleDropdown = () => {
    setdropdownOpen(!dropdownOpen);
  };
  const handleClose = () => {
    setOpenNewKeysModal(false);
  };

  const renderCreateNewKeysModal = () => {
    return (
      <CreateNewKeysModal
        onClose={handleClose}
        onSave={() => {
          onSaveTranslations();
          handleClose();
        }}
        open={openNewKeysModal}
        contentData={contentData}
      />
    );
  };

  const getDropdownContent = () => {
    return (
      <>
        <NavList>
          <NavListSection>
            <IfPermission perm="ui-translations.create">
              <NavListItem
                id="clickable-create-new-translation-keys"
                type="button"
                onClick={() => setOpenNewKeysModal(true)}
              >
                <Icon icon="plus-sign">
                  <FormattedMessage
                    id="stripes-smart-components.buttons.createTranslationKeys"
                    defaultMessage="Create translations keys"
                  />
                </Icon>
              </NavListItem>
            </IfPermission>
          </NavListSection>
        </NavList>
      </>
    );
  };

  const renderActionsMenuTrigger = ({ getTriggerProps, open }) => {
    return (
      <FormattedMessage id="stripes-core.mainnav.myProfileAriaLabel">
        {label => (
          <div style={{ paddingRight: '0.25em', paddingLeft: '0.25em' }}>
            <Button
              data-test-pane-header-actions-button
              buttonStyle="primary"
              marginBottom0
              ariaLabel={label}
              type="button"
              {...getTriggerProps()}
            >
              <Icon icon="ellipsis" size="large" />
            </Button>
          </div>
        )}
      </FormattedMessage>
    );
  };

  const renderActionsMenu = ({ open }) => (
    <DropdownMenu open={open}>{getDropdownContent()}</DropdownMenu>
  );

  const renderDropdownComponent = () => {
    return (
      <Dropdown
        id="editableList-actionsMenu-Dropdown"
        renderTrigger={renderActionsMenuTrigger}
        renderMenu={renderActionsMenu}
        open={dropdownOpen}
        onToggle={toggleDropdown}
        placement="bottom-end"
        relativePosition
        focusHandlers={{ open: () => null }}
      />
    );
  };

  return (
    <>
      {renderCreateNewKeysModal()}
      {renderDropdownComponent()}
    </>
  );
};

TranslationsActionsMenu.propTypes = propTypes;

export default stripesConnect(TranslationsActionsMenu);

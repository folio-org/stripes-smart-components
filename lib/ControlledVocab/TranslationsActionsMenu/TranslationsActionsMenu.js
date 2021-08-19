import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, DropdownMenu, Icon, NavList, NavListItem, NavListSection } from '@folio/stripes-components';
import { FormattedMessage } from 'react-intl';
import { IfPermission } from '@folio/stripes-core';
import CreateNewKeysModal from './CreateNewKeysModal';

function TranslationsActionsMenu(props) {
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
          props.onSaveTranslations();
          handleClose();
        }}
        open={openNewKeysModal}
        contentData={props.contentData}
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
                    id="stripes-smart-components.translationsActionsMenu.createNewKeysModal.label"
                  />
                </Icon>
              </NavListItem>
            </IfPermission>
          </NavListSection>
        </NavList>
      </>
    );
  };

  const renderActionsMenuTrigger = ({ getTriggerProps }) => {
    return (
      <FormattedMessage id="stripes-smart-components.translationsActionsMenu.ariaLabel">
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
}

TranslationsActionsMenu.propTypes = {
  contentData: PropTypes.object.isRequired,
  onSaveTranslations: PropTypes.func.isRequired
};

export default TranslationsActionsMenu;

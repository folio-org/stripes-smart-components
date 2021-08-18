import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  MultiColumnList,
  ModalFooter,
  Button,
  Icon
} from '@folio/stripes-components';
import { FormattedMessage, useIntl } from 'react-intl';

const propTypes = {
  contentData: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  open: PropTypes.bool
};

function CreateNewKeysModal(props) {
  const intl = useIntl();

  const renderFooter = () => {
    return (
      <ModalFooter>
        <Button buttonStyle="primary" onClick={props.onSave}>
          <Icon icon="save" size="large">
            <FormattedMessage id="stripes-core.button.save" />
          </Icon>
        </Button>
        <Button buttonStyle="slim" onClick={props.onClose}>
          <Icon icon="times-circle-solid" size="large">
            <FormattedMessage id="stripes-core.button.cancel" />
          </Icon>
        </Button>
      </ModalFooter>
    );
  };

  const renderConfirmationModal = () => {
    const newKeysArray = [];

    for (const key in props.contentData) {
      if (key) {
        const translationObj = {};
        translationObj.keyName = key;
        translationObj.keyValue = props.contentData[key];
        newKeysArray.push(translationObj);
      }
    }

    return (
      <Modal
        footer={renderFooter()}
        open={props.open}
        onClose={props.onClose}
        label={
          <Icon icon="plus-sign" size="large">
            <FormattedMessage id="stripes-smart-components.translationsActionsMenu.createNewKeysModal.label" />
          </Icon>
        }
      >
        <MultiColumnList
          interactive={false}
          contentData={newKeysArray}
          visibleColumns={['keyName', 'keyValue']}
          columnWidths={{ keyName: '50%', keyValue: '50%' }}
          columnMapping={{
            keyName: intl.formatMessage({
              id: 'stripes-smart-components.translationsActionsMenu.createNewKeysModal.keyName'
            }),
            keyValue: intl.formatMessage({
              id: 'stripes-smart-components.translationsActionsMenu.createNewKeysModal.keyValue'
            })
          }}
        />
      </Modal>
    );
  };

  return <>{renderConfirmationModal()}</>;
};

CreateNewKeysModal.propTypes = propTypes;

export default CreateNewKeysModal;

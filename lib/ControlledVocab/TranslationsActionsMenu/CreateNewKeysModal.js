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

const CreateNewKeysModal = props => {
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
    const { contentData, open, onClose } = props;

    const newKeysArray = [];

    for (const key in contentData) {
      if (key) {
        const translationObj = {};
        translationObj.keyName = key;
        translationObj.keyValue = contentData[key];
        newKeysArray.push(translationObj);
      }
    }

    return (
      <Modal
        footer={renderFooter()}
        open={open}
        onClose={onClose}
        label={
          <Icon icon="plus-sign" size="large">
            <FormattedMessage id="stripes-smart-components.TranslationsActionsMenu.CreateNewKeysModal.label" />
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
              id: 'stripes-smart-components.TranslationsActionsMenu.createNewKeyModal.keyName'
            }),
            keyValue: intl.formatMessage({
              id: 'stripes-smart-components.TranslationsActionsMenu.createNewKeyModal.keyValue'
            })
          }}
        />
      </Modal>
    );
  };

  return <>{renderConfirmationModal()}</>;
};

CreateNewKeysModal.propTypes = {
  contentData: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

export default CreateNewKeysModal;

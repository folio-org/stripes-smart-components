import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  ModalFooter,
  Button,
  Icon,
  Layout,
} from '@folio/stripes-components';

import SafeHTMLMessage from '@folio/react-intl-safe-html';

const propTypes = {
  fetchUsageStatistics: PropTypes.func.isRequired,
  fieldsToDelete: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  optionsToDelete: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
    fieldName: PropTypes.string.isRequired,
    optionData: PropTypes.shape({
      default: PropTypes.bool.isRequired,
      id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
  }))).isRequired,
  submitting: PropTypes.bool.isRequired,
};

const DeleteModal = ({
  handleConfirm,
  handleCancel,
  fetchUsageStatistics,
  fieldsToDelete,
  submitting,
  optionsToDelete,
}) => {
  const [usageStatistics, setUsageStatistics] = useState(null);
  const [usageStatisticsLoaded, setUsageStatisticsLoaded] = useState(false);

  useEffect(() => {
    const fetchStatistics = async () => {
      const promises = fieldsToDelete.map(customField => fetchUsageStatistics(customField.id));
      const response = await Promise.all(promises);
      const body = await Promise.all(response.map(res => res.json()));

      const newUsageStatistics = body.reduce((acc, { fieldId, count }) => [
        ...acc,
        {
          fieldId,
          count,
          name: fieldsToDelete.find(field => field.id === fieldId)?.name,
        }
      ], []);
      setUsageStatistics(newUsageStatistics);
      setUsageStatisticsLoaded(true);
    };

    fetchStatistics();
  }, [fieldsToDelete, fetchUsageStatistics]);

  const footer = (
    <ModalFooter>
      <Button
        buttonStyle="danger"
        disabled={!usageStatisticsLoaded || submitting}
        onClick={handleConfirm}
        data-test-delete-modal-confirm-button
      >
        <FormattedMessage id="stripes-smart-components.customFields.delete.confirm" />
      </Button>
      <Button
        disabled={submitting}
        onClick={handleCancel}
        data-test-delete-modal-cancel-button
      >
        <FormattedMessage id="stripes-smart-components.customFields.delete.cancel" />
      </Button>
    </ModalFooter>
  );

  const renderDeleteList = () => usageStatistics.map(({ name, count, fieldId }) => (
    <div key={fieldId} data-test-custom-field-delete-warning>
      <SafeHTMLMessage
        id="stripes-smart-components.customFields.delete.warning"
        values={{
          fieldName: name,
          usageCount: count
        }}
      />
    </div>
  ));

  const renderOptionsDeleteList = () => {
    const fieldIds = Object.keys(optionsToDelete);

    return fieldIds.map(fieldId => {
      const fieldOptions = optionsToDelete[fieldId];

      return fieldOptions.map(option => {
        const {
          fieldName,
          optionData
        } = option;

        if (fieldsToDelete.find(field => field.name === fieldName)) {
          return null;
        }

        return (
          <div
            key={`${fieldId}_${optionData.value}`}
            data-test-custom-field-option-delete-warning
          >
            <SafeHTMLMessage
              id="stripes-smart-components.customFields.option.delete.warning"
              values={{
                fieldName,
                optionName: optionData.value,
              }}
            />
          </div>
        );
      });
    });
  };

  const renderContent = () => (
    <>
      {renderDeleteList()}
      {renderOptionsDeleteList()}
      <Layout className="marginTop1">
        <FormattedMessage id="stripes-smart-components.customFields.delete.modalMessage" />
      </Layout>
    </>
  );

  return (
    <Modal
      label={<FormattedMessage id="stripes-smart-components.customFields.delete.modalTitle" />}
      open
      footer={footer}
      data-test-delete-custom-fields-modal
    >
      {usageStatisticsLoaded
        ? renderContent()
        : (
          <Icon
            id="custom-fields-statistics-loading-icon"
            icon="spinner-ellipsis"
          />
        )
      }
    </Modal>
  );
};

DeleteModal.propTypes = propTypes;

export default DeleteModal;

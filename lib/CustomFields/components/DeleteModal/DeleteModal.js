import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
  ModalFooter,
  Button,
  Icon,
  Layout,
} from '@folio/stripes-components';

import { FormattedMessage } from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

const propTypes = {
  fetchUsageStatistics: PropTypes.bool.isRequired,
  fieldsToDelete: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

const DeleteModal = ({
  onConfirm,
  onCancel,
  fetchUsageStatistics,
  fieldsToDelete,
}) => {
  const [usageNumber, setUsageNumber] = useState(null);
  const [usageNumberLoaded, setUsageNumberLoaded] = useState(false);

  useEffect(() => {
    const fetchStatistics = async () => {
      const promises = fieldsToDelete.map(cf => {
        return fetchUsageStatistics(cf.data.id);
      });
      const response = await Promise.all(promises);
      const body = await Promise.all(response.map(res => res.json()));

      const usageCount = body.reduce((acc, { fieldId, count }) => [
        ...acc,
        {
          count,
          name: fieldsToDelete.find(field => field.data.id === fieldId).data.values.name,
        }
      ], []);
      setUsageNumber(usageCount);
      setUsageNumberLoaded(true);
    };

    fetchStatistics();
  }, [fieldsToDelete, fetchUsageStatistics]);

  const renderFooter = () => (
    <ModalFooter>
      <Button
        onClick={onConfirm}
        buttonStyle="danger"
        disabled={!usageNumberLoaded}
      >
        <FormattedMessage id="stripes-smart-components.customFields.delete.confirm" />
      </Button>
      <Button onClick={onCancel}>
        <FormattedMessage id="stripes-smart-components.customFields.delete.cancel" />
      </Button>
    </ModalFooter>
  );

  const renderDeleteList = () => usageNumber.map(({ name, count }) => (
    <div>
      <SafeHTMLMessage
        id="stripes-smart-components.customFields.delete.warning"
        values={{
          fieldName: name,
          usageCount: count
        }}
      />
    </div>
  ));

  const renderContent = () => (
    <Fragment>
      {renderDeleteList()}
      <Layout className="marginTop1">
        <FormattedMessage id="stripes-smart-components.customFields.delete.modalMessage" />
      </Layout>
    </Fragment>
  );

  return (
    <Modal
      label={<FormattedMessage id="stripes-smart-components.customFields.delete.modalTitle" />}
      open
      footer={renderFooter()}
    >
      {usageNumberLoaded
        ? renderContent()
        : <Icon icon="spinner-ellipsis" />
      }

    </Modal>
  );
};

DeleteModal.propTypes = propTypes;

export default DeleteModal;

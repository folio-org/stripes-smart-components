import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Row,
  Col,
  ConfirmationModal,
} from '@folio/stripes-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import {
  HiddenField,
  NameField,
  HelpTextField,
  RequiredField,
  OptionsFields,
} from './shared-fields';
import { AddOptionButton } from './components';

const propTypes = {
  deleteOption: PropTypes.func.isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  values: {},
};

const SingleSelectDropdown = ({ fieldNamePrefix, values, onDeleteOption }) => {
  const [data, setData] = useState(values?.selectField?.options?.values || [{}]);
  const [modalIsOpen, setModalState] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState(null);

  const handleDeleteOptionClick = rowIndex => {
    setOptionToDelete(data[rowIndex]);
    setModalState(true);
  };

  const handleOptionDeleteConfirmation = () => {
    const filteredData = data.filter(item => item !== optionToDelete);

    setData(filteredData);
    onDeleteOption(filteredData);
  };

  return (
    <>
      <Row>
        <HiddenField fieldNamePrefix={fieldNamePrefix} />
        <RequiredField fieldNamePrefix={fieldNamePrefix} />
        <NameField fieldNamePrefix={fieldNamePrefix} />
        <HelpTextField fieldNamePrefix={fieldNamePrefix} />
      </Row>
      <Row>
        <OptionsFields
          fieldNamePrefix={fieldNamePrefix}
          data={data}
          onDeleteOption={handleDeleteOptionClick}
        />
      </Row>
      <Row>
        <Col>
          <AddOptionButton onClick={() => setData([...data, {}])} />
        </Col>
      </Row>

      <ConfirmationModal
        open={modalIsOpen}
        id="delete-single-select-option-modal"
        heading={<FormattedMessage id="stripes-smart-components.customFields.dropdown.modal.heading" />}
        message={(
          <SafeHTMLMessage
            id="stripes-smart-components.customFields.dropdown.modal.message"
            values={{
              fieldName: values.name,
              optionName: optionToDelete,
            }}
          />
        )}
        onConfirm={() => {
          handleOptionDeleteConfirmation();
          setModalState(false);
        }}
        onCancel={() => setModalState(false)}
      />
    </>
  );
};

SingleSelectDropdown.propTypes = propTypes;
SingleSelectDropdown.defaultProps = defaultProps;

export default SingleSelectDropdown;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Row,
  Col,
  ConfirmationModal,
} from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
  RequiredField,
  OptionsFields,
} from './shared-fields';
import AddOptionButton from './components';

const propTypes = {
  deleteOption: PropTypes.func.isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  values: {},
};

const SingleSelectDropdown = ({ fieldNamePrefix, values, deleteOption }) => {
  const [data, setData] = useState(values?.selectField?.options?.values || [{}]);
  const [modalIsOpen, setModalState] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState('');

  const clickDeleteOption = rowIndex => {
    setOptionToDelete(data[rowIndex]);
    setModalState(true);
  };

  const deleteOptionLabel = () => {
    const filteredData = data.filter(item => item !== optionToDelete);

    setData(filteredData);
    deleteOption(filteredData);
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
          deleteOption={clickDeleteOption}
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
          <FormattedMessage
            id="stripes-smart-components.customFields.dropdown.modal.message"
            values={{
              fieldName: values.name,
              optionName: optionToDelete,
            }}
          />
        )}
        onConfirm={() => {
          deleteOptionLabel();
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

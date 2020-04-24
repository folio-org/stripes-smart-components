import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { isEqual, get } from 'lodash';

import {
  MultiColumnList,
  TextField,
  IconButton,
  Col,
  Label,
  ConfirmationModal,
} from '@folio/stripes-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import css from './OptionsFields.css';
import { AddOptionButton } from '../../components';

const propTypes = {
  customFieldLabel: PropTypes.string,
  fieldNamePrefix: PropTypes.string.isRequired,
};

const isLabelDuplicated = (label, allLabels) => {
  return (allLabels).filter(currentLabel => label === currentLabel).length > 1;
};

const OptionsFields = ({ fieldNamePrefix, customFieldLabel }) => {
  const [modalIsOpen, setConfirmationModalOpen] = useState(false);
  const [optionToBeDeleted, setOptionToBeDelete] = useState(null);

  useEffect(() => {
    if (optionToBeDeleted !== null) {
      setConfirmationModalOpen(true);
    } else {
      setConfirmationModalOpen(false);
    }
  }, [optionToBeDeleted]);

  const labelValidation = (value, fields) => {
    if (!value) {
      return <FormattedMessage id="stripes-smart-components.customFields.option.required" />;
    }

    if (value.length > 100) {
      return <FormattedMessage id="stripes-smart-components.customFields.characters.limit" values={{ limit: 100 }} />;
    }

    const optionLabels = get(fields, fieldNamePrefix).selectField.options.values;

    if (isLabelDuplicated(value, optionLabels)) {
      return <FormattedMessage id="stripes-smart-components.customFields.option.duplicate" />;
    }

    return null;
  };

  const getContentData = fields => {
    return fields.map((_field, index) => ({ label: index, actions: index }));
  };

  return (
    <FieldArray
      isEqual={isEqual}
      name={`${fieldNamePrefix}.selectField.options.values`}
    >
      {({ fields }) => {
        const optionsListEmpty = !fields.length;

        return (
          <>
            <Col xs={12}>
              <div className={!optionsListEmpty ? css.listWrapper : null}>
                <MultiColumnList
                  contentData={getContentData(fields)}
                  isEmptyMessage={null}
                  visibleColumns={['label', 'actions']}
                  columnMapping={{
                    label:  (
                      <Label tagName="span" required className={css.optionLabel}>
                        <FormattedMessage id="stripes-smart-components.customFields.dropdown.label" />
                      </Label>
                    ),
                    actions: null,
                  }}
                  formatter={{
                    label: ({ rowIndex }) => (
                      <Field
                        className={css.optionInput}
                        component={TextField}
                        name={`${fieldNamePrefix}.selectField.options.values[${rowIndex}]`}
                        marginBottom0
                        required
                        validate={labelValidation}
                        validateFields={[]}
                      />
                    ),
                    actions: ({ rowIndex }) => (
                      <IconButton
                        icon="trash"
                        onClick={() => setOptionToBeDelete(rowIndex)}
                      />
                    )
                  }}
                  columnWidths={{
                    label: '90%',
                  }}
                />
              </div>
              <AddOptionButton onClick={() => { fields.push(''); }} />
            </Col>

            <ConfirmationModal
              open={modalIsOpen}
              id="delete-single-select-option-modal"
              heading={<FormattedMessage id="stripes-smart-components.customFields.dropdown.modal.heading" />}
              message={(
                <SafeHTMLMessage
                  id="stripes-smart-components.customFields.dropdown.modal.message"
                  values={{
                    fieldName: customFieldLabel,
                    optionName: fields.value[optionToBeDeleted],
                  }}
                />
              )}
              onConfirm={() => {
                fields.remove(optionToBeDeleted);
                setOptionToBeDelete(null);
              }}
              onCancel={() => setOptionToBeDelete(null)}
            />
          </>
        );
      }}
    </FieldArray>
  );
};

OptionsFields.propTypes = propTypes;

export default OptionsFields;

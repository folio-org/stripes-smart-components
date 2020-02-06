import React, { Fragment, useReducer, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  isEqual,
  uniqueId,
} from 'lodash';

import {
  AccordionSet,
  ExpandAllButton,
  Paneset,
  Pane,
  Button,
  PaneMenu,
  PaneHeaderIconButton,
  PaneFooter,
  TextField,
  Col,
  Row,
} from '@folio/stripes-components';

import {
  NavigationModal,
  AddButton,
  FieldAccordion,
  TextboxFields,
  DeleteModal,
} from '..';

import {
  fieldTypes,
  fieldTypesLabels,
  defaultFieldConfigs,
} from '../../constants';

import styles from './CustomFieldsForm.css';

const DEFAULT_CUSTOM_FIELDS_SECTION_NAME = 'Additional options';

const propTypes = {
  entityType: PropTypes.element.isRequired,
  fetchUsageStatistics: PropTypes.func.isRequired,
  initialValues: PropTypes.arrayOf(PropTypes.shape({

  })),
  onSubmit: PropTypes.bool.isRequired,
  redirectToView: PropTypes.func.isRequired,
  submitSucceed: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const CustomFieldsForm = ({
  submitSucceed,
  submitting,
  fetchUsageStatistics,
  redirectToView,
  initialValues,
  entityType,
  onSubmit,
}) => {
  const getInitialAccordionsState = () => {
    return initialValues.reduce((accordions, cf) => ({
      ...accordions,
      [cf.id]: false,
    }), {});
  };

  const [accordions, setAccordions] = useState(getInitialAccordionsState);

  const getInitialFormState = () => {
    return {
      customFields: initialValues,
      pristine: true,
      fieldsToDelete: [],
    };
  };

  const stateReducer = (state, { type, payload }) => {
    const { customFields, fieldsToDelete } = state;

    switch (type) {
      case 'ADD_NEW_FIELD': {
        const updatedCustomFields = [...customFields];
        updatedCustomFields.push({
          values: {
            ...defaultFieldConfigs[payload.type],
            entityType,
          },
          id: uniqueId('_unsaved'),
        });

        return {
          ...state,
          customFields: updatedCustomFields,
          pristine: false,
        };
      }
      case 'UPDATE_FIELD_VALUE': {
        const fieldIndex = customFields.findIndex(cf => payload.fieldId === cf.id);

        const updatedCFData = {
          ...customFields[fieldIndex],
          values: {
            ...customFields[fieldIndex].values,
            ...payload.data,
          }
        };

        const updatedCustomFields = [...customFields];
        updatedCustomFields[fieldIndex] = updatedCFData;

        return {
          ...state,
          customFields: updatedCustomFields,
          pristine: isEqual(updatedCustomFields, initialValues),
        };
      }
      case 'DELETE_CUSTOM_FIELD': {
        const newCustomFields = [...customFields];
        const currentFieldPosition = newCustomFields.findIndex(cf => cf.id === payload.fieldId);
        const deletedField = newCustomFields.splice(currentFieldPosition, 1)[0];
        const updatedFieldsToDelete = [...fieldsToDelete];

        if (!deletedField.id.startsWith('_unsaved')) {
          updatedFieldsToDelete.push({ index: currentFieldPosition, data: deletedField });
        }
        return {
          customFields: newCustomFields,
          pristine: isEqual(newCustomFields, initialValues),
          fieldsToDelete: updatedFieldsToDelete,
        };
      }
      case 'CANCEL_DELETE': {
        const newCustomFields = [...customFields];
        fieldsToDelete.forEach(cf => {
          newCustomFields.splice(cf.index, 0, cf.data);
        });

        return {
          customFields: newCustomFields,
          pristine: isEqual(newCustomFields, initialValues),
          fieldsToDelete: [],
        };
      }
      case 'RESET_FORM': {
        return getInitialFormState();
      }
      default: {
        return state;
      }
    }
  };

  const [formState, dispatchFormAction] = useReducer(stateReducer, getInitialFormState());
  const [deleteModalIsDisplayed, setDeleteModalIsDisplayed] = useState(false);

  const {
    pristine,
    fieldsToDelete,
    customFields,
  } = formState;

  const addField = fieldType => {
    dispatchFormAction({ type: 'ADD_NEW_FIELD', payload: { type: fieldType } });
  };

  const updateCustomField = fieldId => data => {
    dispatchFormAction({ type: 'UPDATE_FIELD_VALUE', payload: { fieldId, data } });
  };

  const onDeleteClick = fieldId => () => {
    dispatchFormAction({ type: 'DELETE_CUSTOM_FIELD', payload: { fieldId } });
  };

  const resetFormValues = () => {
    dispatchFormAction({ type: 'RESET_FORM' });
  };

  const cancelDelete = () => {
    setDeleteModalIsDisplayed(false);
    dispatchFormAction({ type: 'CANCEL_DELETE' });
  };

  const renderFirstMenu = () => {
    return (
      <PaneMenu>
        <PaneHeaderIconButton
          onClick={redirectToView}
          icon="times"
        />
      </PaneMenu>
    );
  };

  const handleExpandAll = (newAccordionStatus) => {
    setAccordions(newAccordionStatus);
  };

  const saveCustomFields = () => {
    onSubmit(customFields.map(cf => ({ ...cf.values })));
  };

  const onSaveClick = () => {
    if (fieldsToDelete.length) {
      setDeleteModalIsDisplayed(true);
    } else {
      saveCustomFields();
    }
  };

  const renderExpandAllButton = () => (
    <Row end="xs" className={styles.expandAllWrapper}>
      <Col xs>
        <ExpandAllButton
          accordionStatus={accordions}
          onToggle={handleExpandAll}
        />
      </Col>
    </Row>
  );

  const renderPaneFooter = () => {
    const buttonsDisabled = submitting || (pristine && !fieldsToDelete.length);

    return (
      <PaneFooter
        renderStart={
          <Button
            marginBottom0
            onClick={resetFormValues}
            disabled={buttonsDisabled}
          >
            <FormattedMessage id="stripes-smart-components.customFields.cancel" />
          </Button>
        }
        renderEnd={
          <Button
            marginBottom0
            onClick={onSaveClick}
            disabled={buttonsDisabled}
          >
            <FormattedMessage id="stripes-smart-components.customFields.save" />
          </Button>
        }
      />
    );
  };

  const onToggleAccordion = ({ id }) => {
    setAccordions(currentAccordions => ({
      ...currentAccordions,
      [id]: !currentAccordions[id],
    }));
  };

  const renderFieldAccordions = () => (
    <div className={styles.accordionsWrapper}>
      <AccordionSet accordionStatus={accordions} onToggle={onToggleAccordion}>
        {customFields.map(cf => (
          <FieldAccordion
            id={cf.id}
            formData={cf.values}
            deleteCustomField={onDeleteClick(cf.id)}
            editMode
          >
            <TextboxFields
              values={cf.values}
              onChange={updateCustomField(cf.id)}
            />
          </FieldAccordion>
        ))}
      </AccordionSet>
    </div>
  );

  const renderAccordionName = () => {
    return (
      <Fragment>
        <TextField
          value={DEFAULT_CUSTOM_FIELDS_SECTION_NAME}
          inputClass={styles.accordionNameInput}
          className={styles.inputWrapper}
          disabled
          label={
            <span className={styles.accordionNameLabel}>Section title</span>
          }
        />
      </Fragment>
    );
  };

  const getFieldTypesOptions = () => {
    return Object.values(fieldTypes).map(fieldType => ({
      label: fieldTypesLabels[fieldType],
      value: fieldType,
    }));
  };

  return (
    <Fragment>
      <Paneset>
        <Pane
          paneTitle={<FormattedMessage id="stripes-smart-components.customFields.editCustomFields" />}
          firstMenu={renderFirstMenu()}
          footer={renderPaneFooter()}
          defaultWidth="100%"
        >
          <div className={styles['custom-fields-form-content']}>
            <Row>
              <Col xs={6}>
                {renderAccordionName()}
              </Col>
            </Row>
            {!!customFields.length && renderExpandAllButton()}
            {!!customFields.length && renderFieldAccordions()}
            <AddButton
              onAdd={addField}
              options={getFieldTypesOptions()}
            />
          </div>
        </Pane>
      </Paneset>
      <NavigationModal when={!pristine && !submitSucceed && !submitting} />
      {deleteModalIsDisplayed && (
        <DeleteModal
          open={deleteModalIsDisplayed}
          fetchUsageStatistics={fetchUsageStatistics}
          fieldsToDelete={fieldsToDelete}
          onConfirm={saveCustomFields}
          onCancel={cancelDelete}
        />
      )}
    </Fragment>
  );
};

CustomFieldsForm.propTypes = propTypes;

export default CustomFieldsForm;

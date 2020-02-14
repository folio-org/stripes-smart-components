import React, { Fragment, useReducer, useState, useMemo } from 'react';
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

import NavigationModal from '../../../Notes/components/NavigationModal';
import FieldAccordion from '../FieldAccordion';

import {
  AddButton,
  DeleteModal,
} from './components';

import {
  ADD_NEW_FIELD,
  UPDATE_FIELD_VALUE,
  DELETE_CUSTOM_FIELD,
  CANCEL_DELETE,
  RESET_FORM,
} from './action-types';

import {
  addNewField,
  updateCustomField,
  deleteCustomField,
  cancelDelete,
  resetFormValues,
} from './action-creators';

import {
  fieldTypes,
  fieldTypesLabels,
  defaultFieldConfigs,
} from '../../constants';

import { textboxShape } from '../../shapes';

import styles from './CustomFieldsForm.css';

const propTypes = {
  entityType: PropTypes.string.isRequired,
  fetchUsageStatistics: PropTypes.func.isRequired,
  initialValues: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    values: PropTypes.oneOfType([
      textboxShape,
    ]).isRequired,
  })).isRequired,
  onSubmit: PropTypes.func.isRequired,
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
  const getInitialAccordionsState = () => initialValues.reduce((state, cf) => ({
    ...state,
    [cf.id]: false,
  }), {});

  const [accordions, setAccordions] = useState(getInitialAccordionsState);

  const initialFormState = {
    customFields: initialValues,
    pristine: true,
    fieldsToDelete: [],
  };

  const stateReducer = (state, { type, payload }) => {
    switch (type) {
      case ADD_NEW_FIELD: {
        const updatedCustomFields = [...state.customFields];
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
      case UPDATE_FIELD_VALUE: {
        const fieldIndex = state.customFields.findIndex(cf => payload.fieldId === cf.id);

        const updatedCFData = {
          ...state.customFields[fieldIndex],
          values: {
            ...state.customFields[fieldIndex].values,
            ...payload.data,
          }
        };

        const updatedCustomFields = [...state.customFields];
        updatedCustomFields[fieldIndex] = updatedCFData;

        return {
          ...state,
          customFields: updatedCustomFields,
          pristine: isEqual(updatedCustomFields, initialValues),
        };
      }
      case DELETE_CUSTOM_FIELD: {
        const newCustomFields = [...state.customFields];
        const currentFieldPosition = newCustomFields.findIndex(cf => cf.id === payload.fieldId);
        const deletedField = newCustomFields.splice(currentFieldPosition, 1)[0];
        const updatedFieldsToDelete = [...state.fieldsToDelete];
        const deletedFieldsIsSavedInDB = !deletedField.id.startsWith('_unsaved');

        if (deletedFieldsIsSavedInDB) {
          updatedFieldsToDelete.push({ index: currentFieldPosition, data: deletedField });
        }

        return {
          customFields: newCustomFields,
          pristine: isEqual(newCustomFields, initialValues),
          fieldsToDelete: updatedFieldsToDelete,
        };
      }
      case CANCEL_DELETE: {
        const newCustomFields = [...state.customFields];
        state.fieldsToDelete.forEach(cf => {
          newCustomFields.splice(cf.index, 0, cf.data);
        });

        return {
          customFields: newCustomFields,
          pristine: isEqual(newCustomFields, initialValues),
          fieldsToDelete: [],
        };
      }
      case RESET_FORM: {
        return initialFormState;
      }
      default: {
        return state;
      }
    }
  };

  const [formState, dispatchFormAction] = useReducer(stateReducer, initialFormState);
  const [deleteModalIsDisplayed, setDeleteModalIsDisplayed] = useState(false);

  const {
    pristine,
    fieldsToDelete,
    customFields,
  } = formState;

  const onAddClick = fieldType => {
    dispatchFormAction(addNewField({ type: fieldType }));
  };

  const onFieldUpdate = fieldId => data => {
    dispatchFormAction(updateCustomField({ fieldId, data }));
  };

  const onDeleteClick = fieldId => () => {
    dispatchFormAction(deleteCustomField({ fieldId }));
  };

  const onResetClick = () => {
    dispatchFormAction(resetFormValues());
  };

  const onDeleteCancellation = () => {
    setDeleteModalIsDisplayed(false);
    dispatchFormAction(cancelDelete());
  };

  const firstMenu = (
    <PaneMenu>
      <PaneHeaderIconButton
        onClick={redirectToView}
        icon="times"
      />
    </PaneMenu>
  );

  const handleExpandAll = newAccordionStatus => {
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
    const startButton = (
      <Button
        marginBottom0
        onClick={onResetClick}
        disabled={buttonsDisabled}
      >
        <FormattedMessage id="stripes-smart-components.customFields.cancel" />
      </Button>
    );

    const endButton = (
      <Button
        marginBottom0
        onClick={onSaveClick}
        disabled={buttonsDisabled}
      >
        <FormattedMessage id="stripes-smart-components.customFields.save" />
      </Button>
    );

    return (
      <PaneFooter
        renderStart={startButton}
        renderEnd={endButton}
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
      <AccordionSet
        accordionStatus={accordions}
        onToggle={onToggleAccordion}
      >
        {customFields.map(cf => {
          const {
            id,
            values,
          } = cf;

          return (
            <FieldAccordion
              id={id}
              key={id}
              deleteCustomField={onDeleteClick(id)}
              isEditMode
              onChange={onFieldUpdate(cf.id)}
              fieldData={{ ...values }}
            />
          );
        })}
      </AccordionSet>
    </div>
  );

  const accordionNameInput = (
    <FormattedMessage id="stripes-smart-components.customFields.recordAccordion.defaultName">
      {defaultName => (
        <TextField
          value={defaultName}
          inputClass={styles.accordionNameInput}
          className={styles.inputWrapper}
          disabled
          label={
            <span className={styles.accordionNameLabel}>
              <FormattedMessage id="stripes-smart-components.customFields.settings.sectionTitle" />
            </span>
          }
        />
      )}
    </FormattedMessage>
  );

  const getFieldTypesOptions = () => {
    return Object.values(fieldTypes).map(fieldType => ({
      label: fieldTypesLabels[fieldType],
      value: fieldType,
    }));
  };

  const formattedFieldsToDeleteData = useMemo(() => fieldsToDelete.reduce((acc, cf) => ([
    ...acc,
    {
      index: cf.index,
      id: cf.data.id,
      name: cf.data.values.name,
    }
  ]), []), [fieldsToDelete]);

  return (
    <Fragment>
      <Paneset>
        <Pane
          paneTitle={<FormattedMessage id="stripes-smart-components.customFields.editCustomFields" />}
          firstMenu={firstMenu}
          footer={renderPaneFooter()}
          defaultWidth="100%"
        >
          <div className={styles['custom-fields-form-content']}>
            <Row>
              <Col xs={6}>
                {accordionNameInput}
              </Col>
            </Row>
            {!!customFields.length && renderExpandAllButton()}
            {!!customFields.length && renderFieldAccordions()}
            <AddButton
              options={getFieldTypesOptions()}
              handleAdd={onAddClick}
            />
          </div>
        </Pane>
      </Paneset>
      <NavigationModal when={!pristine && !submitSucceed && !submitting} />
      {deleteModalIsDisplayed && (
        <DeleteModal
          open={deleteModalIsDisplayed}
          fetchUsageStatistics={fetchUsageStatistics}
          fieldsToDelete={formattedFieldsToDeleteData}
          submitting={submitting}
          handleConfirm={saveCustomFields}
          handleCancel={onDeleteCancellation}
        />
      )}
    </Fragment>
  );
};

CustomFieldsForm.propTypes = propTypes;

export default CustomFieldsForm;

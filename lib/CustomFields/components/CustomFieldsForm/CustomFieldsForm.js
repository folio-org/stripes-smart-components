import React, { useState, useMemo } from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import PropTypes from 'prop-types';
import {
  uniqueId,
  isEqual,
  get,
} from 'lodash';

import {
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

import stripesFinalForm from '@folio/stripes-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { Field } from 'react-final-form';

import {
  AddButton,
  DeleteModal,
  CustomFieldsAccordions,
  CustomFieldsDragDropContext,
} from './components';

import {
  fieldTypes,
  fieldTypesLabelIds,
  defaultFieldConfigs,
} from '../../constants';

import {
  textboxShape,
  textareaShape,
  checkboxShape,
  permissionsShape,
} from '../../shapes';

import styles from './CustomFieldsForm.css';

const propTypes = {
  deleteModalIsDisplayed: PropTypes.bool.isRequired,
  entityType: PropTypes.string.isRequired,
  fetchUsageStatistics: PropTypes.func.isRequired,
  fieldOptionsStats: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  fieldsToDelete: PropTypes.arrayOf(PropTypes.shape({
    data: PropTypes.shape({
      id: PropTypes.string.isRequired,
      values: PropTypes.oneOfType([
        textboxShape,
        textareaShape,
        checkboxShape,
      ]).isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
  })).isRequired,
  form: PropTypes.shape({
    change: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
    mutators: PropTypes.shape({
      moveCustomFieldToIndex: PropTypes.func.isRequired,
    }).isRequired,
    reset: PropTypes.func.isRequired,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    customFields: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      values: PropTypes.oneOfType([
        textboxShape,
        textareaShape,
        checkboxShape,
      ]).isRequired,
    })).isRequired,
    sectionTitle: PropTypes.string.isRequired,
  }).isRequired,
  onCancelDelete: PropTypes.func.isRequired,
  onConfirmDelete: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onFormReset: PropTypes.func.isRequired,
  onOptionDelete: PropTypes.func.isRequired,
  optionsStatsLoaded: PropTypes.bool.isRequired,
  optionsToDelete: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
    fieldName: PropTypes.string.isRequired,
    optionData: PropTypes.shape({
      default: PropTypes.bool.isRequired,
      id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
  }))).isRequired,
  permissions: permissionsShape.isRequired,
  pristine: PropTypes.bool.isRequired,
  saveCustomFields: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  valid: PropTypes.bool.isRequired,
  viewRoute: PropTypes.string.isRequired,
};

const defaultProps = {
  fieldOptionsStats: null,
};

const CustomFieldsForm = ({
  submitting,
  viewRoute,
  initialValues,
  entityType,
  permissions,
  pristine,
  handleSubmit,
  valid,
  form,
  onDeleteClick,
  deleteModalIsDisplayed,
  fetchUsageStatistics,
  onConfirmDelete,
  onCancelDelete,
  fieldsToDelete,
  onFormReset,
  saveCustomFields,
  optionsStatsLoaded,
  fieldOptionsStats,
  onOptionDelete,
  optionsToDelete,
}) => {
  const intl = useIntl();
  const getInitialAccordionsState = () => initialValues.customFields.reduce((state, cf) => ({
    ...state,
    [cf.id]: false,
  }), {});
  const [accordions, setAccordions] = useState(getInitialAccordionsState);

  const firstMenu = (
    <PaneMenu>
      <PaneHeaderIconButton
        to={viewRoute}
        icon="times"
      />
    </PaneMenu>
  );

  const onResetClick = () => {
    onFormReset();
    form.reset();
  };

  const renderPaneFooter = () => {
    const buttonsDisabled = !valid || submitting || pristine;
    const startButton = (
      <Button
        marginBottom0
        onClick={onResetClick}
        disabled={buttonsDisabled}
        data-test-custom-fields-cancel-button
      >
        <FormattedMessage id="stripes-smart-components.customFields.cancel" />
      </Button>
    );

    const endButton = (
      <Button
        marginBottom0
        type="submit"
        buttonStyle="primary"
        disabled={buttonsDisabled}
        data-test-custom-fields-save-button
      >
        <FormattedMessage id="stripes-smart-components.customFields.save&Close" />
      </Button>
    );

    return (
      <PaneFooter
        renderStart={startButton}
        renderEnd={endButton}
      />
    );
  };

  const handleExpandAll = newAccordionStatus => {
    setAccordions(newAccordionStatus);
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

  const onToggleAccordion = ({ id }) => {
    setAccordions(currentAccordions => ({
      ...currentAccordions,
      [id]: !currentAccordions[id],
    }));
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    form.mutators.moveCustomFieldToIndex(source.index, destination.index, draggableId);
    if (pristine) {
      const data = form.getState().values;
      saveCustomFields(data, false, false);
      // TODO: save without redirect
    }
  };

  const validateSectionTitle = value => {
    if (!value) {
      return <FormattedMessage id="stripes-smart-components.customFields.recordAccordion.required" />;
    }

    if (value.length > 65) {
      return <FormattedMessage id="stripes-smart-components.customFields.recordAccordion.length" />;
    }

    return null;
  };
  const accordionNameInput = (
    <Field
      required
      name="sectionTitle"
      component={TextField}
      autoFocus
      inputClass={styles.accordionNameInput}
      className={styles.inputWrapper}
      label={
        <span className={styles.accordionNameLabel}>
          <FormattedMessage id="stripes-smart-components.customFields.settings.accordionTitle" />
        </span>
      }
      validate={validateSectionTitle}
      data-test-custom-fields-section-title
    />
  );

  const getFieldTypesOptions = () => {
    return Object.values(fieldTypes)
      .map(fieldType => ({
        label: intl.formatMessage({ id: fieldTypesLabelIds[fieldType] }),
        value: fieldType,
      }))
      .sort((fieldA, fieldB) => fieldA.label.localeCompare(fieldB.label));
  };

  const formattedFieldsToDeleteData = useMemo(() => fieldsToDelete.reduce((acc, cf) => ([
    ...acc,
    {
      index: cf.index,
      id: cf.data.id,
      name: cf.data.values.name,
    }
  ]), []), [fieldsToDelete]);

  const insertDeletedFields = formUtils => {
    for (const field of fieldsToDelete) {
      formUtils.insert(field.index, field.data);
    }
  };

  const insertDeletedOptions = () => {
    const formState = form.getState();

    Object.keys(optionsToDelete).forEach(fieldId => {
      const customFieldIndex = formState.values.customFields.findIndex(cf => cf.id === fieldId);
      const optionsStatePath = `customFields[${customFieldIndex}].values.selectField.options.values`;
      const optionsToRestore = optionsToDelete[fieldId].map(option => option.optionData);
      const currentFieldOptions = get(formState.values, optionsStatePath);
      const mergedOptions = [...currentFieldOptions, ...optionsToRestore];
      const sortedOptions = mergedOptions.sort((opt1, opt2) => opt1.value.localeCompare(opt2.value));

      form.change(optionsStatePath, sortedOptions);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={styles['custom-fields-form']}
    >
      <Paneset>
        <Pane
          id="edit-custom-fields-pane"
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
            <FieldArray isEqual={isEqual} name="customFields">
              {({ fields }) => (
                <>
                  {!!fields.length && renderExpandAllButton()}
                  {!!fields.length && (
                    <CustomFieldsDragDropContext
                      fields={fields}
                      onDragEnd={onDragEnd}
                    >
                      <CustomFieldsAccordions
                        fields={fields}
                        permissions={permissions}
                        accordions={accordions}
                        onToggleAccordion={onToggleAccordion}
                        onDeleteClick={onDeleteClick}
                        changeFieldValue={form.change}
                        getFormState={form.getState}
                        optionsStatsLoaded={optionsStatsLoaded}
                        fieldOptionsStats={fieldOptionsStats}
                        onOptionDelete={onOptionDelete}
                      />
                    </CustomFieldsDragDropContext>
                  )}
                  <AddButton
                    options={getFieldTypesOptions()}
                    handleAdd={(type) => {
                      const id = uniqueId('unsaved_');

                      fields.push({
                        values: {
                          ...defaultFieldConfigs[type],
                          entityType,
                        },
                        id,
                      });
                      setAccordions(currentAccordions => ({
                        ...currentAccordions,
                        [id]: true,
                      }));
                    }}
                    data-test-custom-fields-add-button
                  />
                  {deleteModalIsDisplayed && (
                    <DeleteModal
                      open={deleteModalIsDisplayed}
                      fetchUsageStatistics={fetchUsageStatistics}
                      fieldsToDelete={formattedFieldsToDeleteData}
                      submitting={submitting}
                      handleConfirm={onConfirmDelete}
                      optionsToDelete={optionsToDelete}
                      handleCancel={() => {
                        onCancelDelete();
                        insertDeletedFields(fields);
                        insertDeletedOptions(fields);
                      }}
                      opt
                    />
                  )}
                </>
              )}
            </FieldArray>
          </div>
        </Pane>
      </Paneset>
    </form>
  );
};

CustomFieldsForm.propTypes = propTypes;
CustomFieldsForm.defaultProps = defaultProps;

export default stripesFinalForm({
  navigationCheck: true,
  initialValuesEqual: isEqual,
  subscription: {
    valid: true,
    pristine: true,
  },
  mutators: {
    moveCustomFieldToIndex: ([sourceIndex, destinationIndex, id], state, { changeValue }) => {
      changeValue(state, 'customFields', values => {
        const newCustomFields = [...values];
        newCustomFields.splice(sourceIndex, 1);
        newCustomFields.splice(destinationIndex, 0, values.find(cf => cf.id === id));

        return newCustomFields;
      });
    },
  },
})(CustomFieldsForm);

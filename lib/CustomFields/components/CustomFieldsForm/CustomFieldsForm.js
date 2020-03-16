import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  uniqueId,
  isEqual,
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

import stripesFinalForm from '@folio/stripes-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { Field } from 'react-final-form';

import FieldAccordion from '../FieldAccordion';

import {
  AddButton,
  DeleteModal,
} from './components';

import {
  fieldTypes,
  fieldTypesLabels,
  defaultFieldConfigs,
} from '../../constants';

import { textboxShape } from '../../shapes';

import styles from './CustomFieldsForm.css';

const propTypes = {
  deleteModalIsDisplayed: PropTypes.bool.isRequired,
  entityType: PropTypes.string.isRequired,
  fetchUsageStatistics: PropTypes.func.isRequired,
  fieldsToDelete: PropTypes.object.isRequired,
  form: PropTypes.shape({
    reset: PropTypes.func.isRequired,
  }).isRequired,
  formattedFieldsToDeleteData: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    values: PropTypes.oneOfType([
      textboxShape,
    ]).isRequired,
  })).isRequired,
  onCancelDelete: PropTypes.func.isRequired,
  onConfirmDelete: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  permissions: PropTypes.shape({
    canDelete: PropTypes.bool,
    canEdit: PropTypes.bool,
    canView: PropTypes.bool,
  }).isRequired,
  pristine: PropTypes.bool.isRequired,
  redirectToView: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  valid: PropTypes.bool.isRequired,
};

const CustomFieldsForm = ({
  submitting,
  redirectToView,
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
  formattedFieldsToDeleteData,
}) => {
  const getInitialAccordionsState = () => initialValues.customFields.reduce((state, cf) => ({
    ...state,
    [cf.id]: false,
  }), {});
  const [accordions, setAccordions] = useState(getInitialAccordionsState);

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
    const buttonsDisabled = !valid || submitting || pristine;
    const startButton = (
      <Button
        marginBottom0
        onClick={form.reset}
        disabled={buttonsDisabled}
      >
        <FormattedMessage id="stripes-smart-components.customFields.cancel" />
      </Button>
    );

    const endButton = (
      <Button
        marginBottom0
        type="submit"
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

  const renderFieldAccordions = (fields) => (
    <div className={styles.accordionsWrapper}>
      <AccordionSet
        accordionStatus={accordions}
        onToggle={onToggleAccordion}
      >
        {fields.map((name, index) => (
          <FieldAccordion
            fieldNamePrefix={`${name}.values`}
            id={fields.value[index].id}
            key={fields.value[index].id}
            deleteCustomField={() => {
              fields.remove(index);
              onDeleteClick(fields.value[index])(index);
            }}
            isEditMode
            fieldData={{ ...fields.value[index].values }}
            permissions={permissions}
          />
        ))}
      </AccordionSet>
    </div>
  );

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
      name="sectionTitle"
      component={TextField}
      autoFocus
      inputClass={styles.accordionNameInput}
      className={styles.inputWrapper}
      label={
        <span className={styles.accordionNameLabel}>
          <FormattedMessage id="stripes-smart-components.customFields.settings.sectionTitle" />
        </span>
      }
      validate={validateSectionTitle}
    />
  );

  const getFieldTypesOptions = () => {
    return Object.values(fieldTypes).map(fieldType => ({
      label: fieldTypesLabels[fieldType],
      value: fieldType,
    }));
  };

  const insertDeletedFields = fields => {
    for (const field of fieldsToDelete) {
      fields.insert(field.currentIndex, field.fieldData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
            <FieldArray name="customFields">
              {({ fields }) => (
                <>
                  {!!fields.length && renderExpandAllButton()}
                  {!!fields.length && renderFieldAccordions(fields)}
                  <AddButton
                    options={getFieldTypesOptions()}
                    handleAdd={(type) => {
                      fields.push({
                        values: {
                          ...defaultFieldConfigs[type],
                          entityType,
                        },
                        id: uniqueId('unsaved_'),
                      });
                    }}
                  />
                  {deleteModalIsDisplayed && (
                    <DeleteModal
                      open={deleteModalIsDisplayed}
                      fetchUsageStatistics={fetchUsageStatistics}
                      fieldsToDelete={formattedFieldsToDeleteData}
                      submitting={submitting}
                      handleConfirm={onConfirmDelete}
                      handleCancel={() => {
                        onCancelDelete();
                        insertDeletedFields(fields);
                      }}
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

export default stripesFinalForm({
  navigationCheck: true,
  initialValuesEqual: isEqual,
  subscription: {
    valid: true,
    pristine: true,
  }
})(CustomFieldsForm);

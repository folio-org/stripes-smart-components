import React, { useEffect, useState } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import { OnChange } from 'react-final-form-listeners';

import {
  chunk,
  hasIn,
  get,
  isEqual,
} from 'lodash';

import {
  Accordion,
  Callout,
  Col,
  Row,
  InfoPopover,
  RadioButton,
  Label,
  Icon,
} from '@folio/stripes-components';

import {
  change,
  getFormValues,
} from 'redux-form';

import {
  fieldComponents,
  rowShapes,
  fieldTypes,
  CUSTOM_FIELDS_SECTION_ID,
} from '../../constants';

import {
  useCustomFieldsQuery,
  useSectionTitleQuery,
  useLoadingErrorCallout,
  validateCustomFields,
} from '../../utils';

import css from './EditCustomFieldsRecord.css';

const propTypes = {
  accordionId: PropTypes.string.isRequired,
  backendModuleName: PropTypes.string.isRequired,
  changeFinalFormField: PropTypes.func,
  changeReduxFormField: PropTypes.func,
  columnCount: PropTypes.number,
  configNamePrefix: PropTypes.string,
  customFieldsLabel: PropTypes.node,
  displayWhenClosed: PropTypes.node,
  displayWhenOpen: PropTypes.node,
  entityType: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  fieldComponent: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]).isRequired,
  // it seems like this ought to work for accepting string values
  // (i.e. a single-valued field) or array values (i.e. a multi-select field):
  //   PropTypes.objectOf(PropTypes.oneOf([PropTypes.array, PropTypes.string])),
  // but it doesn't when the value is not yet set:
  //   Warning: Failed prop type: Invalid prop `finalFormCustomFieldsValues.chickenType`
  //   of value `` supplied to `EditCustomFieldsRecord`, expected one of [null,null].
  // so we're stuck with something less precise, but at least it doesn't warn:
  finalFormCustomFieldsValues: PropTypes.object,
  finalFormInstance: PropTypes.object,
  formName: PropTypes.string,
  isCreateMode: PropTypes.bool,
  isReduxForm: PropTypes.bool,
  onComponentLoad: PropTypes.func,
  onToggle: PropTypes.func,
  reduxFormCustomFieldsValues: PropTypes.objectOf(PropTypes.string),
  scope: PropTypes.string,
  sectionId: PropTypes.string,
};

const EditCustomFieldsRecord = ({
  accordionId,
  customFieldsLabel = <FormattedMessage id="stripes-smart-components.customFields" />,
  displayWhenClosed,
  displayWhenOpen,
  onComponentLoad,
  onToggle,
  expanded,
  backendModuleName,
  entityType,
  columnCount = 4,
  isCreateMode = false,
  isReduxForm = false,
  formName,
  changeFinalFormField,
  changeReduxFormField,
  fieldComponent: Field,
  reduxFormCustomFieldsValues,
  finalFormCustomFieldsValues,
  finalFormInstance,
  configNamePrefix,
  scope,
  sectionId,
}) => {
  const { formatMessage } = useIntl();

  const {
    customFields,
    isLoadingCustomFields,
    isCustomFieldsError: customFieldsFetchFailed,
  } = useCustomFieldsQuery({
    moduleName: backendModuleName,
    entityType,
    sectionId,
  });

  const {
    sectionTitle,
    isLoadingSectionTitle,
    isSectionTitleError: sectionTitleFetchFailed,
  } = useSectionTitleQuery({
    moduleName: backendModuleName.toUpperCase(),
    configNamePrefix,
    scope,
  });

  const { calloutRef } = useLoadingErrorCallout(customFieldsFetchFailed || sectionTitleFetchFailed);
  const customFieldsIsVisible = !!customFields?.length && customFields?.some(customField => customField.visible);
  const visibleCustomFields = customFields?.filter(customField => customField.visible);
  const formattedCustomFields = chunk(visibleCustomFields, columnCount);
  const columnWidth = rowShapes / columnCount;
  const customFieldsAccordionTitle = sectionTitle.value || customFieldsLabel;
  const customFieldsLoaded = !isLoadingCustomFields && !customFieldsFetchFailed;
  const sectionTitleLoaded = !isLoadingSectionTitle && !sectionTitleFetchFailed;

  const [isValid, setIsValid] = useState(true);

  const collectDataOptionsForSelect = (customField) => {
    const options = (customField.selectField?.options?.values || []).map(option => ({
      label: option.value,
      value: option.id,
    }));

    if (customField.type === fieldTypes.SELECT) {
      const lowercasedFieldName = customField.name.toLowerCase();
      const emptyOption = {
        label: formatMessage(
          { id: 'stripes-smart-components.customFields.select.placeholder' },
          { fieldLabel: lowercasedFieldName },
        ),
        value: '',
      };

      options.unshift(emptyOption);
    }

    return options;
  };

  useEffect(() => {
    const initializeFields = () => {
      const fieldsToInitialize = {};
      let hasDefaultValues = false;

      customFields.forEach(cf => {
        const fieldHasOptions = (
          cf.type === fieldTypes.SELECT ||
          cf.type === fieldTypes.RADIO_BUTTON_GROUP ||
          cf.type === fieldTypes.MULTISELECT
        );

        const customFieldsFormValues = isReduxForm
          ? reduxFormCustomFieldsValues
          : finalFormCustomFieldsValues;

        const fieldIsEmpty = !hasIn(customFieldsFormValues, cf.refId);

        if (fieldHasOptions && fieldIsEmpty) {
          const valueToSet = cf.type === fieldTypes.MULTISELECT
            ? cf.selectField.options.values.filter(option => option.default).map(option => option.id)
            : cf.selectField.options.values.find(option => option.default)?.id;

          // Only set value if there are default options
          if (valueToSet !== undefined && (Array.isArray(valueToSet) ? valueToSet.length > 0 : true)) {
            fieldsToInitialize[cf.refId] = valueToSet;
            hasDefaultValues = true;
          }
        }
      });

      if (!hasDefaultValues) return;

      if (isReduxForm) {
        Object.entries(fieldsToInitialize).forEach(([refId, value]) => {
          changeReduxFormField(`customFields.${refId}`, value);
        });

        return;
      }

      // For create scenarios, use restart to set as initial values (won't mark form dirty)
      if (isCreateMode && finalFormInstance?.restart) {
        const currentValues = finalFormInstance.getState().values;
        const newInitialValues = {
          ...currentValues,
          customFields: {
            ...currentValues.customFields,
            ...fieldsToInitialize
          }
        };

        finalFormInstance.restart(newInitialValues);
      } else {
        // For edit scenarios or fallback, use change method (will mark form dirty as expected)
        Object.entries(fieldsToInitialize).forEach(([refId, value]) => {
          changeFinalFormField(`customFields.${refId}`, value);
        });
      }
    };

    if (customFieldsLoaded && sectionTitleLoaded) {
      initializeFields();
      onComponentLoad?.();
    }
  // Intentionally excluding form value props (reduxFormCustomFieldsValues, finalFormCustomFieldsValues)
  // here to prevent re-running this effect on every form value change. Fields should only be initialized
  // once on load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    customFieldsLoaded,
    sectionTitleLoaded,
    changeFinalFormField,
    changeReduxFormField,
    customFields,
    formName,
    isReduxForm,
    finalFormInstance,
    isCreateMode,
    onComponentLoad
  ]);

  const renderCustomFieldLabel = customField => (
    <span className={css.fieldLabel}>
      {customField.name}
      {customField.helpText && (
        <span className={css.infoPopover}>
          <InfoPopover
            content={customField.helpText}
            iconSize="small"
          />
        </span>
      )}
    </span>
  );

  const checkValid = customField => {
    if (customField.required && !isValid) {
      return <FormattedMessage id="stripes-smart-components.customFields.recordAccordion.required" />;
    }

    return '';
  };

  const getMultiSelectProps = customField => {
    if (customField.type === fieldTypes.MULTISELECT) {
      return {
        error: checkValid(customField)
      };
    }

    return {};
  };

  const createCustomFieldRenderFunction = customField => (props = {}) => (
    fieldComponents[customField.type] && (
      <Col
        data-test-record-edit-custom-field
        key={customField.refId}
        md={columnWidth}
        xs={rowShapes}
      >
        <Field
          component={fieldComponents[customField.type]}
          name={`customFields.${customField.refId}`}
          required={customField.required}
          label={renderCustomFieldLabel(customField)}
          validate={validateCustomFields(customField)}
          {...props}
          {...getMultiSelectProps(customField)}
        />
        {
          customField.type === fieldTypes.MULTISELECT &&
          <OnChange name={`customFields.${customField.refId}`}>
            {(values) => {
              if (!values.length) {
                setIsValid(false);
              } else {
                setIsValid(true);
              }
            }}
          </OnChange>
        }
      </Col>
    )
  );

  const getRadioButtonSetChildren = customField => {
    return customField.selectField.options.values.map(option => (
      <RadioButton
        checked
        name={`customFields.${customField.refId}`}
        value={option.id}
        id={`customFields.${customField.refId}_${option.id}`}
        label={option.value}
        type="radio"
        key={`customFields.${customField.refId}_${option.id}`}
      />
    ));
  };

  const renderCustomField = customField => {
    if (customField.type === fieldTypes.SELECT) {
      return createCustomFieldRenderFunction(customField)({
        dataOptions: collectDataOptionsForSelect(customField),
      });
    } else if (customField.type === fieldTypes.RADIO_BUTTON_GROUP) {
      return createCustomFieldRenderFunction(customField)({
        children: getRadioButtonSetChildren(customField),
        label: (
          <Label>
            {renderCustomFieldLabel(customField)}
          </Label>
        ),
      });
    } else if (customField.type === fieldTypes.MULTISELECT) {
      return createCustomFieldRenderFunction(customField)({
        dataOptions: collectDataOptionsForSelect(customField),
        onBlur: e => { e.preventDefault(); },
        parse: data => (data || []).map(item => item.value),
        format: item => (item || []).map(option => ({
          value: option,
          label: customField.selectField.options.values.find(_option => _option.id === option)?.value || option,
        })),
        isEqual,
      });
    } else if (customField.type === fieldTypes.CHECKBOX) {
      return createCustomFieldRenderFunction(customField)({ type: 'checkbox' });
    } else if (customField.type === fieldTypes.DATE_PICKER) {
      return createCustomFieldRenderFunction(customField)({ backendDateStandard: 'YYYY-MM-DD' });
    } else {
      return createCustomFieldRenderFunction(customField)();
    }
  };

  const renderFields = () => {
    if (isLoadingCustomFields) {
      return <Icon icon="spinner-ellipsis" />;
    }

    if (!visibleCustomFields?.length) return null;

    return visibleCustomFields.map(renderCustomField);
  };

  const renderCustomFieldsInAccordion = () => {
    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={sectionTitleLoaded
          ? customFieldsAccordionTitle
          : <Icon data-test-custom-fields-loading-icon icon="spinner-ellipsis" />
        }
        displayWhenClosed={displayWhenClosed}
        displayWhenOpen={displayWhenOpen}
      >
        {customFieldsLoaded && formattedCustomFields.map((row, i) => (
          <Row key={i}>
            {row.map(renderCustomField)}
          </Row>
        ))}
      </Accordion>
    );
  };

  const renderCustomFields = () => {
    if (!sectionId || sectionId === CUSTOM_FIELDS_SECTION_ID) {
      return renderCustomFieldsInAccordion();
    }

    return renderFields();
  };

  return (
    <>
      {(!customFieldsLoaded || customFieldsIsVisible) && (
        renderCustomFields()
      )}
      <Callout ref={calloutRef} />
    </>
  );
};

EditCustomFieldsRecord.propTypes = propTypes;

export default connect(
  (state, ownProps) => ({
    reduxFormCustomFieldsValues: get(getFormValues(ownProps.formName)(state), 'customFields'),
  }),
  (dispatch, { formName, isReduxForm }) => {
    const props = {};

    if (isReduxForm) {
      props.changeReduxFormField = (fieldName, value) => dispatch(change(formName, fieldName, value));
    }

    return props;
  }
)(EditCustomFieldsRecord);

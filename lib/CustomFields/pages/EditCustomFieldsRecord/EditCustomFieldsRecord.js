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
} from '../../constants';

import {
  selectModuleId,
  selectOkapiData,
} from '../../selectors';

import {
  useCustomFieldsFetch,
  useSectionTitleFetch,
  useLoadingErrorCallout,
  validateCustomFields,
} from '../../utils';

import css from './EditCustomFieldsRecord.css';

const propTypes = {
  accordionId: PropTypes.string.isRequired,
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired,
  changeFinalFormField: PropTypes.func,
  changeReduxFormField: PropTypes.func,
  columnCount: PropTypes.number,
  customFieldsLabel: PropTypes.node,
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
  formName: PropTypes.string,
  isReduxForm: PropTypes.bool,
  okapi: PropTypes.shape({
    tenant: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  onComponentLoad: PropTypes.func,
  onToggle: PropTypes.func,
  reduxFormCustomFieldsValues: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  columnCount: 4,
  customFieldsLabel: <FormattedMessage id="stripes-smart-components.customFields" />,
  isReduxForm: false,
};

const EditCustomFieldsRecord = ({
  accordionId,
  customFieldsLabel,
  onComponentLoad,
  onToggle,
  expanded,
  okapi,
  backendModuleId,
  backendModuleName,
  entityType,
  columnCount,
  isReduxForm,
  formName,
  changeFinalFormField,
  changeReduxFormField,
  fieldComponent: Field,
  reduxFormCustomFieldsValues,
  finalFormCustomFieldsValues,
}) => {
  const { formatMessage } = useIntl();

  const {
    customFields,
    customFieldsLoaded,
    customFieldsFetchFailed,
  } = useCustomFieldsFetch(okapi, backendModuleId, entityType);

  const {
    sectionTitle,
    sectionTitleLoaded,
    sectionTitleFetchFailed,
  } = useSectionTitleFetch(okapi, backendModuleName.toUpperCase());

  const { calloutRef } = useLoadingErrorCallout(customFieldsFetchFailed || sectionTitleFetchFailed);
  const customFieldsIsVisible = !!customFields?.length && customFields?.some(customField => customField.visible);
  const visibleCustomFields = customFields?.filter(customField => customField.visible);
  const formattedCustomFields = chunk(visibleCustomFields, columnCount);
  const columnWidth = rowShapes / columnCount;
  const customFieldsAccordionTitle = sectionTitle.value || customFieldsLabel;

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

          if (isReduxForm) {
            changeReduxFormField(`customFields.${cf.refId}`, valueToSet);
          } else {
            changeFinalFormField(`customFields.${cf.refId}`, valueToSet);
          }
        }
      });
    };

    if (customFieldsLoaded && sectionTitleLoaded) {
      initializeFields();
      onComponentLoad?.();
    }
  }, [
    customFieldsLoaded,
    sectionTitleLoaded,
    changeFinalFormField,
    changeReduxFormField,
    customFields,
    formName,
    isReduxForm,
    reduxFormCustomFieldsValues,
    finalFormCustomFieldsValues,
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
      });
    } else if (customField.type === fieldTypes.CHECKBOX) {
      return createCustomFieldRenderFunction(customField)({ type: 'checkbox' });
    } else if (customField.type === fieldTypes.DATE_PICKER) {
      return createCustomFieldRenderFunction(customField)({ backendDateStandard: 'YYYY-MM-DD' });
    } else {
      return createCustomFieldRenderFunction(customField)();
    }
  };

  return (
    <>
      {(!customFieldsLoaded || customFieldsIsVisible) && (
        <Accordion
          open={expanded}
          id={accordionId}
          onToggle={onToggle}
          label={sectionTitleLoaded
            ? customFieldsAccordionTitle
            : <Icon data-test-custom-fields-loading-icon icon="spinner-ellipsis" />
          }
        >
          {
            customFieldsLoaded && formattedCustomFields.map((row, i) => (
              <Row key={i}>
                {row.map(renderCustomField)}
              </Row>
            ))
          }
        </Accordion>
      )}
      <Callout ref={calloutRef} />
    </>
  );
};

EditCustomFieldsRecord.propTypes = propTypes;
EditCustomFieldsRecord.defaultProps = defaultProps;

export default connect(
  (state, ownProps) => ({
    backendModuleId: selectModuleId(state, ownProps.backendModuleName),
    okapi: selectOkapiData(state),
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

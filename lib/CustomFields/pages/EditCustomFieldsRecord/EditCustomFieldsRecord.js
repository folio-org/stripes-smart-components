import React, { useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
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
} from '@folio/stripes-components';

import {
  change as reduxFormChange,
  getFormValues,
} from 'redux-form';

import {
  fieldComponents,
  rowShapes,
  fieldTypes,
  formTypes,
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
  changeFormValue: PropTypes.func,
  columnCount: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  entityType: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  fieldComponent: PropTypes.func.isRequired,
  finalFormCustomFieldsValues: PropTypes.objectOf(PropTypes.string),
  formName: PropTypes.string,
  formType: PropTypes.oneOf(Object.values(formTypes)),
  okapi: PropTypes.shape({
    tenant: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  reduxFormCustomFieldsValues: PropTypes.shape({
    customFields: PropTypes.objectOf(PropTypes.string),
  }),
};

const defaultProps = {
  columnCount: 4,
};

const EditCustomFieldsRecord = ({
  accordionId,
  onToggle,
  expanded,
  okapi,
  backendModuleId,
  backendModuleName,
  entityType,
  columnCount,
  dispatch,
  formType,
  formName,
  changeFormValue,
  fieldComponent: Field,
  reduxFormCustomFieldsValues,
  finalFormCustomFieldsValues,
}) => {
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
  const dataIsLoaded = sectionTitleLoaded && customFieldsLoaded;
  const customFieldsIsVisible = customFields?.length && customFields?.some(customField => customField.visible);
  const accordionIsVisible = dataIsLoaded && customFieldsIsVisible;
  const visibleCustomFields = customFields?.filter(customField => customField.visible);
  const formattedCustomFields = chunk(visibleCustomFields, columnCount);
  const columnWidth = rowShapes / columnCount;

  const collectDataOptionsForSelect = (customField) => {
    return (customField.selectField?.options?.values || []).map(option => ({
      label: option,
      value: option,
    }));
  };

  useEffect(() => {
    const initializeFields = () => {
      customFields.forEach(cf => {
        const fieldHasOptions = (
          cf.type === fieldTypes.SELECT ||
          cf.type === fieldTypes.RADIO_BUTTON_SET
        );

        if (formType === formTypes.REDUX_FORM) {
          const fieldIsEmpty = !hasIn(reduxFormCustomFieldsValues, cf.refId);

          if (fieldHasOptions && fieldIsEmpty) {
            const valueToSet = cf.selectField.defaults[0];

            dispatch(reduxFormChange(formName, `customFields.${cf.refId}`, valueToSet));
          }
        } else {
          const fieldIsEmpty = !hasIn(finalFormCustomFieldsValues, cf.refId);

          if (fieldHasOptions && fieldIsEmpty) {
            const valueToSet = cf.selectField.defaults[0];

            changeFormValue(`customFields.${cf.refId}`, valueToSet);
          }
        }
      });
    };

    if (customFieldsLoaded && sectionTitleLoaded) {
      initializeFields();
    }
  }, [
    customFieldsLoaded,
    sectionTitleLoaded,
    changeFormValue,
    customFields,
    dispatch,
    formName,
    formType,
    reduxFormCustomFieldsValues,
    finalFormCustomFieldsValues,
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
        />
      </Col>
    )
  );

  const getRadioButtonSetChildren = customField => {
    return customField.selectField.options.values.map(option => (
      <RadioButton
        checked
        value={option}
        id={option}
        label={option}
        type="radio"
      />
    ));
  };

  const renderCustomField = customField => {
    if (customField.type === fieldTypes.SELECT) {
      return createCustomFieldRenderFunction(customField)({
        dataOptions: collectDataOptionsForSelect(customField),
      });
    } else if (customField.type === fieldTypes.RADIO_BUTTON_SET) {
      return createCustomFieldRenderFunction(customField)({
        children: getRadioButtonSetChildren(customField),
        label: (
          <Label required>
            {renderCustomFieldLabel(customField)}
          </Label>
        ),
        required: true,
      });
    } else {
      return createCustomFieldRenderFunction(customField)();
    }
  };

  return (
    <>
      {accordionIsVisible && (
        <Accordion
          open={expanded}
          id={accordionId}
          onToggle={onToggle}
          label={sectionTitle.value}
        >
          {
            formattedCustomFields.map((row, i) => (
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
  })
)(EditCustomFieldsRecord);

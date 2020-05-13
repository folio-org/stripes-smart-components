import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import {
  isEqual,
  get,
} from 'lodash';

import {
  TextField,
  RadioButton,
  MultiColumnList,
  Label,
  Col,
  Checkbox,
} from '@folio/stripes-components';

import { AddOptionButton } from '../components';

import { NO_DEFAULT_OPTIONS_VALUE } from '../../../../constants';

import css from './OptionsField.css';

const propTypes = {
  changeFieldValue: PropTypes.func.isRequired,
  defaultOptions: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  isMultiSelect: PropTypes.bool,
  maxOptionsNumber: PropTypes.number,
};

const defaultProps = {
  isMultiSelect: false,
  maxOptionsNumber: null,
};

const isLabelDuplicated = (label, allLabels) => {
  return allLabels.filter(currentLabel => label === currentLabel).length > 1;
};

const OptionsField = ({
  fieldNamePrefix,
  maxOptionsNumber,
  changeFieldValue,
  defaultOptions,
  isMultiSelect,
}) => {
  const validateLabel = (label, fields) => {
    if (!label) {
      return <FormattedMessage id="stripes-smart-components.customFields.option.required" />;
    }

    if (label.length > 100) {
      return <FormattedMessage id="stripes-smart-components.customFields.characters.limit" values={{ limit: 100 }} />;
    }

    const optionLabels = get(fields, fieldNamePrefix).selectField.options.values;

    if (isLabelDuplicated(label, optionLabels)) {
      return <FormattedMessage id="stripes-smart-components.customFields.option.duplicate" />;
    }

    return null;
  };

  const getContentData = fields => {
    if (isMultiSelect) {
      return fields.map((_field, index) => ({ index }));
    }

    return [{}].concat(fields.map((_field, index) => ({ index: index + 1 })));
  };

  const getLabelField = rowData => {
    if (!isMultiSelect && !rowData.rowIndex) {
      return null;
    }

    const index = (isMultiSelect ? rowData.rowIndex : rowData.rowIndex - 1);

    return (
      <Field
        className={css.optionInput}
        name={`${fieldNamePrefix}.selectField.options.values[${index}]`}
        validate={validateLabel}
        validateFields={[]}
        marginBottom0
      >
        {(fieldProps) => (
          <TextField
            {...fieldProps}
            onChange={e => {
              if (isMultiSelect && defaultOptions.includes(fieldProps.input.value)) {
                changeFieldValue(`${fieldNamePrefix}.selectField.defaults`, [...defaultOptions, e.target.value]);
              }

              if (fieldProps.input.value === defaultOptions) {
                changeFieldValue(`${fieldNamePrefix}.selectField.defaults`, e.target.value);
              }
              fieldProps.input.onChange(e);
            }}
          />
        )}
      </Field>
    );
  };

  const renderHeading = () => {
    return <span className={css.heading}><FormattedMessage id="stripes-smart-components.customFields.options" /></span>;
  };

  const labelForDefaultColumn = isMultiSelect
    ? <FormattedMessage id="stripes-smart-components.customFields.options.defaults" />
    : <FormattedMessage id="stripes-smart-components.customFields.options.default" />;

  return (
    <Col xs>
      <FieldArray
        isEqual={isEqual}
        name={`${fieldNamePrefix}.selectField.options.values`}
      >
        {({ fields }) => {
          const maxOptionsNumberReached = fields.length === maxOptionsNumber;
          const hasOptionsNumberLimit = maxOptionsNumber;
          const optionsToAddLeft = hasOptionsNumberLimit && maxOptionsNumber - fields.length;

          return (
            <>
              {renderHeading()}
              <div className={css.listWrapper}>
                <MultiColumnList
                  contentData={getContentData(fields)}
                  visibleColumns={['label', 'defaults']}
                  isEmptyMessage={null}
                  formatter={{
                    label: rowData => getLabelField(rowData),
                    defaults: rowData => (isMultiSelect
                      ? (
                        <Field
                          component={Checkbox}
                          type="checkbox"
                          name={`${fieldNamePrefix}.selectField.defaults`}
                          value={fields.value[rowData.rowIndex]}
                          checked={
                            (fields.value[rowData.rowIndex] !== '') &&
                            defaultOptions.includes(fields.value[rowData.rowIndex])
                          }
                          disabled={fields.value[rowData.rowIndex] === ''}
                        />
                      ) : (
                        <Field
                          component={RadioButton}
                          name={`${fieldNamePrefix}.selectField.defaults`}
                          value={rowData.rowIndex
                            ? fields.value[rowData.rowIndex - 1]
                            : NO_DEFAULT_OPTIONS_VALUE
                          }
                          marginBottom0
                          type="radio"
                          className={css.defaultControl}
                          disabled={fields.value[rowData.rowIndex - 1] === ''}
                        />
                      )
                    ),
                  }}
                  columnMapping={{
                    label: (
                      <Label tagName="span" required className={css.optionLabel}>
                        <FormattedMessage id="stripes-smart-components.customFields.dropdown.label" />
                      </Label>
                    ),
                    defaults: labelForDefaultColumn,
                  }}
                  columnWidths={{
                    label: '90%',
                    defaults: '10%',
                  }}
                />
              </div>
              {!maxOptionsNumberReached
                ? (
                  <AddOptionButton
                    onClick={() => { fields.push(''); }}
                    optionsToAddLeft={optionsToAddLeft}
                  />
                )
                : (
                  <span className={css.maxOptionsNumberReached}>
                    <FormattedMessage id="stripes-smart-components.customFields.options.maxNumberReached" />
                  </span>
                )
              }
            </>
          );
        }}
      </FieldArray>
    </Col>
  );
};

OptionsField.propTypes = propTypes;
OptionsField.defaultProps = defaultProps;

export default OptionsField;

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
  IconButton,
  Icon,
} from '@folio/stripes-components';

import { AddOptionButton } from '../../components';

import { NO_DEFAULT_OPTIONS_VALUE } from '../../../../../constants';

import css from './OptionsField.css';

const propTypes = {
  changeFieldValue: PropTypes.func.isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  isMultiSelect: PropTypes.bool,
  maxOptionsNumber: PropTypes.number,
  onOptionDelete: PropTypes.func.isRequired,
  optionsStatsLoaded: PropTypes.bool.isRequired,
  usedOptions: PropTypes.arrayOf(PropTypes.string),
};

const isLabelDuplicated = (label, allLabels) => {
  return allLabels.filter(currentLabel => label === currentLabel).length > 1;
};

const OptionsField = ({
  fieldNamePrefix,
  maxOptionsNumber = null,
  changeFieldValue,
  isMultiSelect = false,
  usedOptions,
  optionsStatsLoaded,
  onOptionDelete,
}) => {
  const validateLabel = (label, fields) => {
    if (!label) {
      return <FormattedMessage id="stripes-smart-components.customFields.option.required" />;
    }

    if (label.length > 100) {
      return <FormattedMessage id="stripes-smart-components.customFields.characters.limit" values={{ limit: 100 }} />;
    }

    const optionLabels = get(fields, `${fieldNamePrefix}.selectField.options.values`, []).map(option => option.value);

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
        component={TextField}
        className={css.optionInput}
        name={`${fieldNamePrefix}.selectField.options.values[${index}].value`}
        validate={validateLabel}
        validateFields={[]}
        marginBottom0
        label={<FormattedMessage id="stripes-smart-components.customFields.dropdown.label" />}
      />
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
        data-test-custom-fields-options-field
      >
        {({ fields }) => {
          const maxOptionsNumberReached = fields.length === maxOptionsNumber;
          const hasOptionsNumberLimit = maxOptionsNumber;
          const optionsToAddLeft = hasOptionsNumberLimit && maxOptionsNumber - fields.length;
          const noDefaultOptionsSelected = fields.value?.every(option => !option.default);

          const labelHeaderName = `${fieldNamePrefix}-label`;
          const defaultsHeaderName = `${fieldNamePrefix}-defaults`;
          const deleteHeaderName = `${fieldNamePrefix}-delete`;

          return (
            <>
              {renderHeading()}
              <div className={css.listWrapper}>
                <MultiColumnList
                  contentData={getContentData(fields)}
                  visibleColumns={[labelHeaderName, defaultsHeaderName, deleteHeaderName]}
                  isEmptyMessage={null}
                  formatter={{
                    [labelHeaderName]: rowData => getLabelField(rowData),
                    [defaultsHeaderName]: rowData => (isMultiSelect
                      ? (
                        <Field
                          component={Checkbox}
                          type="checkbox"
                          name={`${fieldNamePrefix}.selectField.options.values[${rowData.rowIndex}].default`}
                          checked={fields.value[rowData.rowIndex].default}
                          disabled={fields.value[rowData.rowIndex].value === ''}
                          label={(
                            <span className="sr-only">
                              <FormattedMessage id="stripes-smart-components.customFields.dropdown.default" />
                            </span>
                          )}
                        />
                      ) : (
                        <Field
                          component={RadioButton}
                          name={`${fieldNamePrefix}.selectField.options.values[${rowData.rowIndex - 1}].default`}
                          marginBottom0
                          type="radio"
                          value={rowData.rowIndex
                            ? fields.value[rowData.rowIndex - 1].id
                            : NO_DEFAULT_OPTIONS_VALUE
                          }
                          checked={(!rowData.rowIndex && noDefaultOptionsSelected)
                            || fields.value?.[rowData.rowIndex - 1]?.default === true
                          }
                          disabled={fields.value?.[rowData.rowIndex - 1]?.value === ''}
                          onChange={e => {
                            const values = fields.value.map(option => ({
                              ...option,
                              default: option.id === e.target.value,
                            }));

                            changeFieldValue(`${fieldNamePrefix}.selectField.options.values`, values);
                          }}
                          label={(
                            <span className="sr-only">
                              <FormattedMessage id="stripes-smart-components.customFields.dropdown.default" />
                            </span>
                          )}
                        />
                      )
                    ),
                    [deleteHeaderName]: rowData => {
                      if (optionsStatsLoaded) {
                        const optionIndex = isMultiSelect
                          ? rowData.rowIndex
                          : rowData.rowIndex - 1;

                        const isOptionRow = isMultiSelect || rowData.rowIndex !== 0;
                        const isOptionUsed = isOptionRow && usedOptions.includes(fields.value[optionIndex].id);
                        const minNumberOfOptions = 2;
                        const minNumberOfOptionsReached = fields.length === minNumberOfOptions;

                        if (isOptionRow && !minNumberOfOptionsReached && !isOptionUsed) {
                          return (
                            <IconButton
                              icon="trash"
                              className={css.defaultControl}
                              onClick={() => {
                                onOptionDelete(fields.value[optionIndex], optionIndex);
                                fields.remove(optionIndex);
                              }}
                              data-test-delete-option
                            />
                          );
                        }
                        return null;
                      }

                      return <span aria-busy="true"><Icon icon="spinner-ellipsis" /></span>;
                    }
                  }}
                  columnMapping={{
                    [labelHeaderName]: (
                      <Label
                        className={css.optionLabel}
                        tagName="span"
                        required
                      >
                        <FormattedMessage id="stripes-smart-components.customFields.dropdown.label" />
                        <span className="sr-only">
                          <FormattedMessage id="stripes-smart-components.customFields.required" />
                        </span>
                      </Label>
                    ),
                    [defaultsHeaderName]: labelForDefaultColumn,
                    [deleteHeaderName]: (
                      <span className="sr-only">
                        <FormattedMessage id="stripes-smart-components.customFields.option.deleteLabel" />
                      </span>
                    ),
                  }}
                  columnWidths={{
                    [labelHeaderName]: '84%',
                    [defaultsHeaderName]: '10%',
                    [deleteHeaderName]: '6%',
                  }}
                />
              </div>
              {!maxOptionsNumberReached
                ? (
                  <AddOptionButton
                    onClick={() => {
                      const idNumbers = fields.value
                        .map(field => field.id.split('opt_')[1])
                        .map(numStr => parseInt(numStr, 10))
                        .sort((a, b) => b - a); // descending sort
                      const maxNumber = idNumbers[0];

                      fields.push({
                        value: '',
                        id: `opt_${maxNumber + 1}`,
                      });
                    }}
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

export default OptionsField;

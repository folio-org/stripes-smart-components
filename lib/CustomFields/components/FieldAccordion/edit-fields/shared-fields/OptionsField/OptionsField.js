import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import {
  isEqual,
  get,
} from 'lodash';

import {
  TextField,
  RadioButton,
  Label,
  Col,
  Checkbox,
  Tooltip,
  IconButton,
} from '@folio/stripes-components';

import DNDList from '../../../../../../DNDList';
import { AddOptionButton } from '../../components';

import { NO_DEFAULT_OPTIONS_VALUE } from '../../../../../constants';

import css from './OptionsField.css';

const propTypes = {
  changeFieldValue: PropTypes.func.isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  isMultiSelect: PropTypes.bool,
  isSingleSelect: PropTypes.bool,
  maxOptionsNumber: PropTypes.number,
  onDragEnd: PropTypes.func.isRequired,
};

const defaultProps = {
  isMultiSelect: false,
  isSingleSelect: true,
  maxOptionsNumber: null,
};

const isLabelDuplicated = (label, allLabels) => {
  return allLabels.filter(currentLabel => label === currentLabel).length > 1;
};

const OptionsField = ({
  fieldNamePrefix,
  maxOptionsNumber,
  changeFieldValue,
  isMultiSelect,
  isSingleSelect,
  onDragEnd,
}) => {
  const intl = useIntl();

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

  const getOptionNameById = (fields, id) => fields.value.find(option => option.id === id)?.value;

  const handleDragStart = (fields) => (start, provided) => {
    const startIndex = isMultiSelect ? start.source.index + 1 : start.source.index;

    provided.announce(intl.formatMessage({
      id: 'stripes-smart-components.customFields.option.dragDrop.lifted',
    }, {
      name: getOptionNameById(fields, start.draggableId),
      position: startIndex,
    }));
  };

  const handleDragEnd = (fields) => (result, provided) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (!isMultiSelect && !destination.index) {
      // trying to swap an option with empty row for `no default`
      return;
    }

    // need to subtract 1 because DragDrop indexing starts with empty row for `no default`
    // this means that `fields[0]` would have index value 1 in DragDrop
    const destIndex = isMultiSelect ? destination.index : destination.index - 1;
    const startIndex = isMultiSelect ? source.index : source.index - 1;

    const options = [...fields.value];
    const [removed] = options.splice(startIndex, 1);
    options.splice(destIndex, 0, removed);

    const name = getOptionNameById(fields, result.draggableId);

    const message = result.destination
      ? intl.formatMessage({
        id: 'stripes-smart-components.customFields.option.dragDrop.moved',
      }, {
        name,
        start: startIndex + 1,
        end: destIndex + 1,
      })
      : intl.formatMessage({
        id: 'stripes-smart-components.customFields.option.dragDrop.returned',
      }, {
        name,
        position: startIndex + 1,
      });

    provided.announce(message);

    changeFieldValue(`${fieldNamePrefix}.selectField.options.values`, options);
    onDragEnd();
  };

  const handleDragUpdate = (fields) => (update, provided) => {
    const destIndex = isMultiSelect ? update.destination.index + 1 : update.destination.index;

    const message = update.destination
      ? intl.formatMessage({
        id: 'stripes-smart-components.customFields.option.dragDrop.moving',
      }, {
        name: getOptionNameById(fields, update.draggableId),
        position: destIndex,
      })
      : intl.formatMessage({
        id: 'stripes-smart-components.customFields.option.dragDrop.notOverDroppable',
      });

    provided.announce(message);
  };

  const getContentData = fields => {
    if (isMultiSelect) {
      return fields.value.map((field, index) => ({ index, id: field.id }));
    }

    return [{ id: 'opt_null' }].concat(fields.value.map((field, index) => ({ index: index + 1, id: field.id })));
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
      />
    );
  };

  const getFormatter = (fields) => {
    const noDefaultOptionsSelected = fields.value.every(option => !option.default);

    return {
      label: (rowData) => getLabelField(rowData),
      defaults: rowData => (isMultiSelect
        ? (
          <Field
            component={Checkbox}
            type="checkbox"
            className={css.defaultControl}
            name={`${fieldNamePrefix}.selectField.options.values[${rowData.rowIndex}].default`}
            checked={fields.value[rowData.rowIndex].default}
            disabled={fields.value[rowData.rowIndex].value === ''}
          />
        ) : (
          <Field
            component={RadioButton}
            name={`${fieldNamePrefix}.selectField.options.values[${rowData.rowIndex - 1}].default`}
            marginBottom0
            type="radio"
            className={css.defaultControl}
            value={rowData.rowIndex
              ? fields.value[rowData.rowIndex - 1].id
              : NO_DEFAULT_OPTIONS_VALUE
            }
            checked={(!rowData.rowIndex && noDefaultOptionsSelected)
              || fields.value[rowData.rowIndex - 1]?.default === true
            }
            disabled={fields.value[rowData.rowIndex - 1]?.value === ''}
            onChange={e => {
              const values = fields.value.map(option => ({
                ...option,
                default: option.id === e.target.value,
              }));

              changeFieldValue(`${fieldNamePrefix}.selectField.options.values`, values);
            }}
          />
        )
      ),
      reorder: (rowData) => (
        // show icon for all rows for multiselect or all, except first row in other fields
        (!isMultiSelect && rowData.rowIndex) || isMultiSelect
          ? (
            <Tooltip
              text={intl.formatMessage({
                id: 'stripes-smart-components.customFields.option.dragDrop',
              }, {
                name: fields.value[isMultiSelect ? rowData.rowIndex : rowData.rowIndex - 1]?.value,
              })}
              id="custom-field-drag-drop-button-tooltip"
            >
              {({ ref, ariaIds }) => (
                <IconButton
                  icon="drag-drop"
                  aria-labelledby={ariaIds.text}
                  aria-describedby={ariaIds.sub}
                  ref={ref}
                />
              )}
            </Tooltip>
          )
          : null
      ),
    };
  };

  const renderHeading = () => {
    return <span className={css.heading}><FormattedMessage id="stripes-smart-components.customFields.options" /></span>;
  };

  const renderAddOptionButton = (fields) => {
    const hasOptionsNumberLimit = maxOptionsNumber;
    const optionsToAddLeft = hasOptionsNumberLimit && maxOptionsNumber - fields.length;

    return (
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
    );
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

          return (
            <>
              {renderHeading()}
              <div className={css.listWrapper}>
                <DNDList
                  onDragEnd={handleDragEnd(fields)}
                  onDragStart={handleDragStart(fields)}
                  onDragUpdate={handleDragUpdate(fields)}
                  isRowDraggable={(_rowData, rowIndex) => !(isSingleSelect && rowIndex === 0)}
                  contentData={getContentData(fields)}
                  visibleColumns={['label', 'defaults', 'reorder']}
                  columnMapping={{
                    label: (
                      <Label tagName="span" required className={css.optionLabel}>
                        <FormattedMessage id="stripes-smart-components.customFields.dropdown.label" />
                      </Label>
                    ),
                    defaults: labelForDefaultColumn,
                    reorder: '',
                  }}
                  columnWidths={{
                    label: '85%',
                    defaults: '10%',
                    reorder: '5%',
                  }}
                  isEmptyMessage={null}
                  formatter={getFormatter(fields)}
                />
              </div>
              {!maxOptionsNumberReached
                ? renderAddOptionButton(fields)
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

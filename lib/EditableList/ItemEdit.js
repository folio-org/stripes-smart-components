import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Field } from 'redux-form';
import { TextField } from '@folio/stripes-components';
import css from './EditableList.css';

// Prevents input field validation on cancel. Issue https://github.com/erikras/redux-form/issues/860
function handleDefaultFieldBlur(event) {
  const { relatedTarget } = event;

  if (relatedTarget && relatedTarget.getAttribute('data-type-button') === 'cancel') {
    event.preventDefault();
  }
}

const ItemEdit = ({
  rowIndex,
  error,
  field,
  visibleFields,
  columnMapping,
  fieldComponents,
  readOnlyFields,
  widths,
  cells,
  autoFocus
}) => {
  const fields = visibleFields.map((name, fieldIndex) => {
    if (readOnlyFields.indexOf(name) === -1) {
      let mappedName = name;
      if (Object.hasOwnProperty.call(columnMapping, name)) {
        mappedName = columnMapping[name];
      }

      const fieldName = `${field}[${rowIndex}].${name}`;
      const ariaLabel = `${mappedName} ${rowIndex}`;
      const fieldKey = `${field}-${name}-${rowIndex}`;
      const fieldStyle = { flex: `0 0 ${widths[name]}`, width: `${widths[name]}`, padding: '6px' };
      const fieldProps = {
        'name': fieldName,
        'aria-label': ariaLabel,
      };

      if (Object.hasOwnProperty.call(fieldComponents, name)) {
        return (
          <div key={fieldKey} style={fieldStyle}>
            { fieldComponents[name]({ fieldProps, fieldIndex, name, field, rowIndex }) }
          </div>
        );
      }

      return (
        <div key={fieldKey} style={fieldStyle}>
          <Field
            {...fieldProps}
            component={TextField}
            marginBottom0
            fullWidth
            placeholder={name}
            {...(error && { error: error.fieldErrors[name] })}
            autoFocus={autoFocus && fieldIndex === 0}
            onBlur={handleDefaultFieldBlur}
          />
        </div>
      );
    }
    return cells[fieldIndex];
  });

  return (
    <div className={classnames(css.editListRow, css.baselineListRow)} role="row" aria-rowindex={rowIndex + 2}>
      {fields}
      <div data-test-common-errors className={css.editableListError}>
        {error.commonErrors}
      </div>
    </div>
  );
};

ItemEdit.propTypes = {
  autoFocus: PropTypes.bool,
  cells: PropTypes.arrayOf(PropTypes.object),
  columnMapping: PropTypes.object,
  error: PropTypes.oneOfType([
    PropTypes.shape({
      commonErrors: PropTypes.arrayOf(PropTypes.node),
      fieldErrors: PropTypes.objectOf(PropTypes.node),
    }),
    PropTypes.bool,
  ]),
  field: PropTypes.string,
  fieldComponents: PropTypes.object,
  readOnlyFields: PropTypes.arrayOf(PropTypes.string),
  rowIndex: PropTypes.number.isRequired,
  visibleFields: PropTypes.arrayOf(PropTypes.string),
  widths: PropTypes.object,
};

ItemEdit.defaultProps = {
  error: null,
};

export default ItemEdit;

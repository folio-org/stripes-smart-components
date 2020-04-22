import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import {
  MultiColumnList,
  TextField,
  RadioButton,
  IconButton,
} from '@folio/stripes-components';

import css from './OptionsFields.css';

const propTypes = {
  data: PropTypes.arrayOf(PropTypes.string),
  deleteOption: PropTypes.func.isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
};

const OptionsFields = ({ fieldNamePrefix, data, deleteOption }) => {
  const labelValidation = label => {
    if (!label) {
      return <FormattedMessage id="stripes-smart-components.customFields.option.required" />;
    }

    if (label.length > 100) {
      return <FormattedMessage id="stripes-smart-components.customFields.characters.limit" values={{ limit: 100 }} />;
    }

    if (data.find(item => item === label)) {
      return <FormattedMessage id="stripes-smart-components.customFields.option.duplicate" />;
    }

    return null;
  };

  return (
    <div className={css.list}>
      <MultiColumnList
        contentData={data}
        visibleColumns={['label', 'code', 'default', 'actions']}
        columnMapping={{
          label: <FormattedMessage id="stripes-smart-components.customFields.dropdown.label" />,
          code: <FormattedMessage id="stripes-smart-components.customFields.dropdown.code" />,
          default: <FormattedMessage id="stripes-smart-components.customFields.dropdown.default" />,
          actions: '',
        }}
        formatter={{
          label: ({ rowIndex }) => (
            <Field
              component={TextField}
              name={`${fieldNamePrefix}.selectField.options.values[${rowIndex}]`}
              marginBottom0
              required
              validate={labelValidation}
            />
          ),
          code: () => <TextField marginBottom0 disabled />,
          default: () => (
            <Field
              component={RadioButton}
              name={`${fieldNamePrefix}.selectField.defaults`}
              type="radio"
              inline
              marginBottom0
            />
          ),
          actions: ({ rowIndex }) => (
            <IconButton
              icon="trash"
              onClick={() => deleteOption(rowIndex)}
            />
          )
        }}
        columnWidths={{
          label: '42%',
          code: '42%',
          default: '10%',
        }}
      />
    </div>
  );
};

OptionsFields.propTypes = propTypes;

export default OptionsFields;

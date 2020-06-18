import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  RadioButton,
  MultiColumnList,
  Checkbox,
  Col,
} from '@folio/stripes-components';

import css from './Options.css';

const propTypes = {
  isMultiSelect: PropTypes.bool,
  selectField: PropTypes.shape({
    options: PropTypes.shape({
      values: PropTypes.arrayOf(PropTypes.shape({
        default: PropTypes.bool.isRequired,
        id: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      })).isRequired,
    }).isRequired,
  })
};

const defaultProps = {
  isMultiSelect: false,
};

const Options = ({ selectField, isMultiSelect }) => {
  const contentData = selectField.options.values.map(item => {
    return {
      label: item.value,
      isDefault: item.default,
    };
  });

  const labelForDefaultColumn = isMultiSelect
    ? <FormattedMessage id="stripes-smart-components.customFields.options.defaults" />
    : <FormattedMessage id="stripes-smart-components.customFields.options.default" />;

  return (
    <Col data-test-custom-field-options xs>
      <MultiColumnList
        contentData={contentData}
        visibleColumns={['label', 'isDefault']}
        columnMapping={{
          label: <FormattedMessage id="stripes-smart-components.customFields.dropdown.label" />,
          isDefault: labelForDefaultColumn,
        }}
        formatter={{
          label: option => option.label,
          isDefault: option => (isMultiSelect ?
            (
              <Checkbox
                checked={option.isDefault}
                disabled
              />
            ) : (
              <RadioButton
                checked={option.isDefault}
                disabled
                className={css.defaultControl}
              />
            )
          )
        }}
        columnWidths={{
          label: '90%',
          isDefault: '10%',
        }}
      />
    </Col>
  );
};

Options.propTypes = propTypes;
Options.defaultProps = defaultProps;

export default Options;

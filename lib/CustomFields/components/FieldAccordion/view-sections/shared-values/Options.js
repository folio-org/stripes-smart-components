import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  RadioButton,
  MultiColumnList,
  Col,
} from '@folio/stripes-components';

import css from './Options.css';

const propTypes = {
  selectField: PropTypes.shape({
    defaults: PropTypes.array,
    options: PropTypes.shape({
      sorted: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
  })
};

const Options = ({ selectField }) => {
  const contentData = selectField.options.values.map(item => {
    return {
      label: item,
      isDefault: selectField.defaults.includes(item),
    };
  });

  return (
    <Col xs>
      <MultiColumnList
        contentData={contentData}
        visibleColumns={['label', 'isDefault']}
        columnMapping={{
          label: <FormattedMessage id="stripes-smart-components.customFields.dropdown.label" />,
          isDefault: <FormattedMessage id="stripes-smart-components.customFields.options.default" />,
        }}
        formatter={{
          label: option => option.label,
          isDefault: option => (
            <RadioButton
              checked={option.isDefault}
              disabled
              className={css.defaultControl}
            />
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

export default Options;

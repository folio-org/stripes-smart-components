import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  MultiColumnList,
  RadioButton
} from '@folio/stripes-components';

const propTypes = {
  selectField: PropTypes.shape({
    defaults: PropTypes.array,
    options: PropTypes.shape({
      sorted: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
  })
};

const NameValue = ({ selectField }) => {
  const contentData = selectField.options.values.map(item => ({ value: item }));

  return (
    <MultiColumnList
      contentData={contentData}
      visibleColumns={['label', 'code', 'default']}
      columnMapping={{
        label: <FormattedMessage id="stripes-smart-components.customFields.dropdown.label" />,
        code: <FormattedMessage id="stripes-smart-components.customFields.dropdown.code" />,
        default: <FormattedMessage id="stripes-smart-components.customFields.dropdown.default" />,
      }}
      formatter={{
        label: item => item.value,
        default: () => (
          <RadioButton
            disabled
          />
        ),
      }}
      columnWidths={{
        label: '40%',
        code: '40%',
      }}
    />
  );
};

NameValue.propTypes = propTypes;

export default NameValue;

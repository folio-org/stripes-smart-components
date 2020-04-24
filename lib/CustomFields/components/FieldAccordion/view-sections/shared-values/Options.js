import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { MultiColumnList } from '@folio/stripes-components';

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
  const contentData = selectField.options.values.map(item => ({ value: item }));

  return (
    <MultiColumnList
      contentData={contentData}
      visibleColumns={['label']}
      columnMapping={{
        label: <FormattedMessage id="stripes-smart-components.customFields.dropdown.label" />,
      }}
      formatter={{
        label: item => item.value,
      }}
    />
  );
};

Options.propTypes = propTypes;

export default Options;

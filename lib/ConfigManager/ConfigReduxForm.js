import React from 'react';

import stripesForm from '@folio/stripes-form';

import ConfigForm from './ConfigForm';

export default stripesForm({
  form: 'configForm',
  navigationCheck: true,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(props => <ConfigForm {...props} />);

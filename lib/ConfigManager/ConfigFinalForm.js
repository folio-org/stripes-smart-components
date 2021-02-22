import React from 'react';

import stripesFinalForm from '@folio/stripes-final-form';

import ConfigForm from './ConfigForm';

export default stripesFinalForm({
  navigationCheck: true,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(props => <ConfigForm {...props} />);

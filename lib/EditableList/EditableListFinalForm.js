import React from 'react';
import { FieldArray } from 'react-final-form-arrays';
import { Field } from 'react-final-form';

import stripesFinalForm from '@folio/stripes-final-form';

import EditableListForm from './EditableListForm';

export default stripesFinalForm({
  navigationCheck: true,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(props => <EditableListForm
  {...props}
  FieldArray={FieldArray}
  FieldComponent={Field}
/>);

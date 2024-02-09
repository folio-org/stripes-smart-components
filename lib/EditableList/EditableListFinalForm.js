import React from 'react';
import { FieldArray } from 'react-final-form-arrays';
import { Field } from 'react-final-form';

import stripesFinalForm from '@folio/stripes-final-form';

import EditableListForm from './EditableListForm';

export default stripesFinalForm({
  navigationCheck: true,
  enableReinitialize: true,
  destroyOnUnmount: false,
  keepDirtyOnReinitialize: true, // when update request fails with an error - keep unsaved changes in form
})(props => <EditableListForm
  {...props}
  FieldArray={FieldArray}
  FieldComponent={Field}
/>);

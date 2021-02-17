import React from 'react';
import { FieldArray, Field } from 'redux-form';

import stripesForm from '@folio/stripes-form';

import EditableListForm from './EditableListForm';

export default stripesForm({
  form: 'editableListForm',
  navigationCheck: true,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(props => <EditableListForm
  {...props}
  FieldArray={FieldArray}
  FieldComponent={Field}
/>);

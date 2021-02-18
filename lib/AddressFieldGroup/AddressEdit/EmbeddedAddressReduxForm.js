import React from 'react';
import { Field } from 'redux-form';

import EmbeddedAddressForm from './EmbeddedAddressForm';

import withReduxFormContext from './withReduxFormContext';

const EmbeddedAddressReduxForm = (props) => <EmbeddedAddressForm {...props} Field={Field} />;

export default withReduxFormContext(EmbeddedAddressReduxForm);

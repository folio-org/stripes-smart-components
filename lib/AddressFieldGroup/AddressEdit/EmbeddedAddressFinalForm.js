import React from 'react';
import { Field } from 'react-final-form';

import EmbeddedAddressForm from './EmbeddedAddressForm';

const EmbeddedAddressFinalForm = (props) => <EmbeddedAddressForm {...props} Field={Field} />;

export default EmbeddedAddressFinalForm;


import React from 'react';
import { ReduxFormContext } from 'redux-form';

const withReduxFormContext = WrappedComponent => props => (
  <ReduxFormContext.Consumer>
    {reduxForm => (<WrappedComponent {...props} reduxForm={reduxForm} />)}
  </ReduxFormContext.Consumer>
);

export default withReduxFormContext;

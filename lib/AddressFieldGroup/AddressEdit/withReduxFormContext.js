import React from 'react';
import { ReduxFormContext } from 'redux-form';

const withReduxFormContext = WrappedComponent => props => (
  <ReduxFormContext.Consumer>
    {({ values, dispatch, change }) => (
      <WrappedComponent
        {...props}
        values={values}
        change={(name, value) => dispatch(change(name, value))}
      />
    )}
  </ReduxFormContext.Consumer>
);

export default withReduxFormContext;

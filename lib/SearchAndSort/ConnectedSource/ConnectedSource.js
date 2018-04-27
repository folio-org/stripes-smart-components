// Simple classes that know how to answer certain questions about a
// Stripes module's resources, and perform certain operations, based
// on whether they were populated by stripes-connect or Apollo
// GraphQL.
//
// Both classes need to provide the same methods with the same
// signatures, as client code will not know or care which class it's
// getting; but there's no way to express that requirement in ES6.

import ApolloConnectedSource from './ApolloConnectedSource';
import StripesConnectedSource from './StripesConnectedSource';

// Factory creates the appropriate kind of ConnectedSource for the props we have
function makeConnectedSource(props, logger, resourceName) {
  if (props.parentData) {
    return new ApolloConnectedSource(props, logger, resourceName);
  } else if (props.parentResources) {
    return new StripesConnectedSource(props, logger, resourceName);
  } else {
    // eslint-disable-next-line no-console
    console.warn('makeConnectedSource: no parentData or parentResources');
    return null;
  }
}

export default makeConnectedSource;

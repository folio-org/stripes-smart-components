// Simple classes that know how to answer certain questions about a
// Stripes module's resources based on whether they were populated by
// stripes-connect or GraphQL.
//
// Both classes need to provide the same methods with the same
// signatures, as client code will not know or care which class it's
// getting; but there's no way to express that requirement in ES6.


class GraphQLResourcesAnalyzer {
  constructor(props, logger, resourceName) {
    const name = resourceName || props.apolloResource;
    if (!name) {
      console.warn('GraphQLResourcesAnalyzer: no resource-name specified'); // eslint-disable-line no-console
    }

    this.props = props;
    this.data = props.parentData || {};
    this.recordsObj = this.data[name] || {};
    this.logger = logger;
  }

  records() {
    const res = this.recordsObj.records || [];
    this.logger.log('analyze-all', 'records:', res);
    return res;
  }

  // Number of records retrieved so far. This does not seem to be
  // directly specified in the Apollo data, so we'll just count the
  // actual records.
  resultCount() {
    const res = this.records().length;
    this.logger.log('analyze-all', 'resultCount:', res);
    return res;
  }

  // Number of records in the result-set, available to be retrieved
  totalCount() {
    const res = this.pending() ? null : this.recordsObj.totalCount;
    this.logger.log('analyze-all', 'totalCount:', res);
    return res;
  }

  // False before and after a request, true only during
  pending() {
    let res = this.data.loading;
    if (res === undefined) res = false;
    this.logger.log('analyze-all', 'pending:', res);
    return res;
  }

  // False before and during a request, true only after
  loaded() {
    const res = this.records() && !this.pending();
    this.logger.log('analyze-all', 'loaded', res);
    return res;
  }

  // I _think_ this is correct, but our server currently never supplies errors
  failure() {
    const res = this.data.error;
    this.logger.log('analyze-all', 'failure', res);
    return res;
  }

  failureMessage() {
    // react-apollo failure object has: extraInfo, graphQLErrors, message, networkError, stack
    const res = `GraphQL error: ${this.data.error.message.replace(/.*:\s*/, '')}`;
    this.logger.log('analyze-all', 'failureMessage', res);
    return res;
  }

  fetchMore(increment) {
    const name = this.props.apolloResource;
    const data = this.props.parentData;

    data.fetchMore({
      // We would like to specify `notifyOnNetworkStatusChange: true` here, but it has to be in the initial query
      variables: {
        cql: this.props.queryFunction(this.props.parentResources.query, this.props, this.props.parentResources, this.logger),
        offset: this.resultCount(),
        limit: increment,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          [name]: Object.assign({}, prev[name], {
            records: [...prev[name].records, ...fetchMoreResult[name].records],
          }),
        });
      },
    });
  }

  successfulMutations() { // TODO once we have mutations happening via GraphQL
    const res = this.recordsObj.successfulMutations || [];
    this.logger.log('analyze-all', 'successfulMutations', res);
    return res;
  }
}


class StripesConnectResourcesAnalyzer {
  constructor(props, logger, resourceName = 'records') {
    this.resources = props.parentResources || {};
    this.recordsObj = props.parentResources[resourceName] || {};
    this.logger = logger;
  }

  records() {
    const res = this.recordsObj.records || [];
    this.logger.log('analyze-all', 'records:', res);
    return res;
  }

  resultCount() {
    const res = this.resources.resultCount;
    this.logger.log('analyze-all', 'resultCount:', res);
    return res;
  }

  totalCount() {
    const res = this.recordsObj.hasLoaded ? this.recordsObj.other.totalRecords : null;
    this.logger.log('analyze-all', 'totalCount:', res);
    return res;
  }

  pending() {
    let res = this.recordsObj.isPending;
    if (res === undefined) res = true;
    this.logger.log('analyze-all', 'pending:', res);
    return res;
  }

  loaded() {
    const res = this.recordsObj.hasLoaded;
    this.logger.log('analyze-all', 'loaded', res);
    return res;
  }

  failure() {
    const res = this.recordsObj.failed;
    this.logger.log('analyze-all', 'failure', res);
    return res;
  }

  failureMessage() {
    const failed = this.recordsObj.failed;
    // stripes-connect failure object has: dataKey, httpStatus, message, module, resource, throwErrors
    const res = `Error ${failed.httpStatus}: ${failed.message.replace(/.*:\s*/, '')}`;
    this.logger.log('analyze-all', 'failureMessage', res);
    return res;
  }

  successfulMutations() {
    const res = this.recordsObj.successfulMutations || [];
    this.logger.log('analyze-all', 'successfulMutations', res);
    return res;
  }
}


// Creates the appropriate kind of ResourcesAnalyzer for the props we have
function makeResourcesAnalyzer(props, logger, resourceName) {
  if (props.parentData) {
    return new GraphQLResourcesAnalyzer(props, logger, resourceName);
  } else if (props.parentResources) {
    return new StripesConnectResourcesAnalyzer(props, logger, resourceName);
  } else {
    // eslint-disable-next-line no-console
    console.warn('makeResourcesAnalyzer: no parentData or parentResources');
    return null;
  }
}


export default makeResourcesAnalyzer;

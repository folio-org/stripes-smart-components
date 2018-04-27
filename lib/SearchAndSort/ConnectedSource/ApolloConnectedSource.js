export default class ApolloConnectedSource {
  constructor(props, logger, resourceName) {
    const name = resourceName || props.apolloResource;
    if (!name) {
      console.warn('ApolloConnectedSource: no resource-name specified'); // eslint-disable-line no-console
    }

    this.props = props;
    this.data = props.parentData || {};
    this.recordsObj = this.data[name] || {};
    this.logger = logger;
  }

  records() {
    const res = this.recordsObj.records || [];
    this.logger.log('source', 'records:', res);
    return res;
  }

  // Number of records retrieved so far. This does not seem to be
  // directly specified in the Apollo data, so we'll just count the
  // actual records.
  resultCount() {
    const res = this.records().length;
    this.logger.log('source', 'resultCount:', res);
    return res;
  }

  // Number of records in the result-set, available to be retrieved
  totalCount() {
    const res = this.pending() ? null : this.recordsObj.totalCount;
    this.logger.log('source', 'totalCount:', res);
    return res;
  }

  // False before and after a request, true only during
  pending() {
    let res = this.data.loading;
    if (res === undefined) res = false;
    this.logger.log('source', 'pending:', res);
    return res;
  }

  // False before and during a request, true only after
  loaded() {
    const res = this.records() && !this.pending();
    this.logger.log('source', 'loaded', res);
    return res;
  }

  // I _think_ this is correct, but our server currently never supplies errors
  failure() {
    const res = this.data.error;
    this.logger.log('source', 'failure', res);
    return res;
  }

  failureMessage() {
    // react-apollo failure object has: extraInfo, graphQLErrors, message, networkError, stack
    const res = `GraphQL error: ${this.data.error.message.replace(/.*:\s*/, '')}`;
    this.logger.log('source', 'failureMessage', res);
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
    this.logger.log('source', 'successfulMutations', res);
    return res;
  }
}

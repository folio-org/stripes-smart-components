// Simple classes that know how to answer certain questions about a
// Stripes module's resources based on whether they were populated by
// stripes-connect or GraphQL.
//
// Both classes need to provide the same methods with the same
// signatures, as client code will not know or care which class it's
// getting; but there's no way to express that requirement in ES6.


class GraphQLResourcesAnalyzer {
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

  failure() {
    const res = this.recordsObj.failed;
    this.logger.log('analyze-all', 'failure', res);
    return res;
  }

  loaded() {
    const res = this.recordsObj.hasLoaded;
    this.logger.log('analyze-all', 'loaded', res);
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

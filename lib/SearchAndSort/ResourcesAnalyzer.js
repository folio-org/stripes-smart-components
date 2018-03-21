// Simple class that knows how to answer certain questions about a
// Stripes module's resources based on whether they were populated by
// stripes-connect or GraphQL.

class ResourcesAnalyzer {
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
    this.logger.log('analyze', 'resultCount:', res);
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

export default ResourcesAnalyzer;

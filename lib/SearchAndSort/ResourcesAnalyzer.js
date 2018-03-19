// Simple class that knows how to answer certain questions about a
// Stripes module's resources based on whether they were populated by
// stripes-connect or GraphQL.

class ResourcesAnalyzer {
  constructor(resources, logger) {
    this.resources = resources || {};
    this.recordsObj = resources.records || {};
    this.logger = logger;
  }

  records() {
    const res = this.recordsObj.records || [];
    this.logger.log('analyze', 'ResourcesAnalyzer:records:', res.length);
    return res;
  }

  totalCount() {
    const res = this.recordsObj.hasLoaded ? this.recordsObj.other.totalRecords : null;
    this.logger.log('analyze', 'ResourcesAnalyzer:totalCount:', res);
    return res;
  }

  pending() {
    let res = this.recordsObj.isPending;
    if (res === undefined) res = true;
    this.logger.log('analyze', 'ResourcesAnalyzer:pending:', res);
    return res;
  }
}

export default ResourcesAnalyzer;

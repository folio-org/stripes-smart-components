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
    const records = this.recordsObj.records || [];
    this.logger.log('analyze', 'ResourcesAnalyzer:records:', records.length);
    return records;
  }

  totalCount() {
    const count = this.recordsObj.hasLoaded ? this.recordsObj.other.totalRecords : null;
    this.logger.log('analyze', 'ResourcesAnalyzer:totalCount:', count);
    return count;
  }
}

export default ResourcesAnalyzer;

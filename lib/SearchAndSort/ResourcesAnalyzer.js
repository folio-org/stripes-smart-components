// Simple class that knows how to answer certain questions about a
// Stripes module's resources based on whether they were populated by
// stripes-connect or GraphQL.

class ResourcesAnalyzer {
  constructor(resources, logger) {
    this.resources = resources;
    this.logger = logger;
  }

  records() {
    const records = (this.resources.records || {}).records || [];
    this.logger.log('analyze', 'ResourcesAnalyzer:records: ', records.length);
    return records;
  }
}

export default ResourcesAnalyzer;

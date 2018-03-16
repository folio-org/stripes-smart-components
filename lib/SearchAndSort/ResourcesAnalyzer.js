// Simple class that knows how to answer certain questions about a
// Stripes module's resources based on whether they were populated by
// stripes-connect or GraphQL.

class ResourcesAnalyzer {
  constructor(resources) {
    this.resources = resources;
  }

  records() {
    return this.resources.records;
  }
}

export default ResourcesAnalyzer;

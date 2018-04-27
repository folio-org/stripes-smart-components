export default class StripesConnectedSource {
  constructor(props, logger, resourceName = 'records') {
    this.props = props;
    this.resources = props.parentResources || {};
    this.recordsObj = props.parentResources[resourceName] || {};
    this.logger = logger;
  }

  records() {
    const res = this.recordsObj.records || [];
    this.logger.log('source', 'records:', res);
    return res;
  }

  resultCount() {
    const res = this.resources.resultCount;
    this.logger.log('source', 'resultCount:', res);
    return res;
  }

  totalCount() {
    const res = this.recordsObj.hasLoaded ? this.recordsObj.other.totalRecords : null;
    this.logger.log('source', 'totalCount:', res);
    return res;
  }

  pending() {
    let res = this.recordsObj.isPending;
    if (res === undefined) res = true;
    this.logger.log('source', 'pending:', res);
    return res;
  }

  loaded() {
    const res = this.recordsObj.hasLoaded;
    this.logger.log('source', 'loaded', res);
    return res;
  }

  failure() {
    const res = this.recordsObj.failed;
    this.logger.log('source', 'failure', res);
    return res;
  }

  failureMessage() {
    const failed = this.recordsObj.failed;
    // stripes-connect failure object has: dataKey, httpStatus, message, module, resource, throwErrors
    const res = `Error ${failed.httpStatus}: ${failed.message.replace(/.*:\s*/, '')}`;
    this.logger.log('source', 'failureMessage', res);
    return res;
  }

  fetchMore(increment) {
    this.props.parentMutator.resultCount.replace(this.resultCount() + increment);
    // ... and stripes-connect notices this change and does the rest by magic
  }

  successfulMutations() {
    const res = this.recordsObj.successfulMutations || [];
    this.logger.log('source', 'successfulMutations', res);
    return res;
  }
}

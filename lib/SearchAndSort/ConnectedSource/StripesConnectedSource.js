const UNKNOWN_RECORDS_COUNT = 999999999;

export default class StripesConnectedSource {
  constructor(props, logger, resourceName = 'records') {
    this.logger = logger;
    this.update(props, resourceName);
  }

  update(props, resourceName = 'records') {
    this.props = props;
    this.resources = props.parentResources || props.resources || {};
    this.recordsObj = this.resources[resourceName] || {};
    this.mutator = props.parentMutator || props.mutator;
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

  /**
   * when there are > 10k results to a search, the `totalRecords`
   * value comes back as `999999999`, so we use that value to indicate
   * that the count is, in fact, undefined vs returning null to indicate
   * that the count has not been calculated.
   */
  totalCount() {
    let res;
    if (!this.recordsObj.hasLoaded) {
      res = null;
    } else {
      res = this.recordsObj.other.totalRecords !== UNKNOWN_RECORDS_COUNT ?
        this.recordsObj.other.totalRecords : undefined;
    }
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
    this.mutator.resultCount.replace(this.resultCount() + increment);
    // ... and stripes-connect notices this change and does the rest by magic
  }

  // fetch by offset which is passed in as index.
  fetchOffset(index) {
    this.mutator.resultOffset.replace(index);
  }

  successfulMutations() {
    const res = this.recordsObj.successfulMutations || [];
    this.logger.log('source', 'successfulMutations', res);
    return res;
  }
}

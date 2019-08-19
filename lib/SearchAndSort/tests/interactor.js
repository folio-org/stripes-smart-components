import {
  interactor,
  Interactor,
} from '@bigtest/interactor';

export default interactor(class SearchAndSortInteractor {
  defaultScope = '[data-test-search-and-sort]';
  filterPane = new Interactor('[data-test-filter-pane]');
  collapseFilterPaneButton = new Interactor('[data-test-collapse-filter-pane-button]');
  expandFilterPaneButton = new Interactor('[data-test-expand-filter-pane-button]');
});

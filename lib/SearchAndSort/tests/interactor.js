import {
  interactor,
  Interactor,
  isPresent,
  text,
  selectable,
} from '@bigtest/interactor';
import ExpandFilterPaneButtonInteractor from '../components/ExpandFilterPaneButton/tests/interactor';

export default interactor(class SearchAndSortInteractor {
  defaultScope = '[data-test-search-and-sort]';
  filterPane = new Interactor('[data-test-filter-pane]');
  collapseFilterPaneButton = new Interactor('[data-test-collapse-filter-pane-button]');
  expandFilterPaneButton = new ExpandFilterPaneButtonInteractor();

  resultsSubtitle = text('#paneHeaderpane-results-subtitle');
  noResultsMessageIsPresent = isPresent('[class^=mclEmptyMessage]');
  noResultsMessage = text('[class^=mclEmptyMessage]');
  selectQueryIndex = selectable('#input-user-search-qindex');
});

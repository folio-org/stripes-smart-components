import {
  interactor,
  Interactor,
  isPresent,
  text,
  selectable,
  scoped,
} from '@bigtest/interactor';

import SearchFieldInteractor from '@folio/stripes-components/lib/SearchField/tests/interactor';
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor';

import ExpandFilterPaneButtonInteractor from '../components/ExpandFilterPaneButton/tests/interactor';

export default interactor(class SearchAndSortInteractor {
  defaultScope = '[data-test-search-and-sort]';
  filterPane = new Interactor('[data-test-filter-pane]');
  collapseFilterPaneButton = new Interactor('[data-test-collapse-filter-pane-button]');
  expandFilterPaneButton = new ExpandFilterPaneButtonInteractor();

  resultsSubtitle = text('#paneHeaderpane-results-subtitle');
  customPaneSub = scoped('[data-test-custom-pane-sub]');
  noResultsMessageIsPresent = isPresent('[class^=mclEmptyMessage]');
  noResultsMessage = text('[class^=mclEmptyMessage]');
  selectQueryIndex = selectable('#input-user-search-qindex');
  searchField = scoped('[class^=searchFieldWrap]', SearchFieldInteractor);
  resetAll = scoped('#clickable-reset-all', ButtonInteractor);
});

import {
  interactor,
  clickable,
  scoped,
} from '@bigtest/interactor';

@interactor class FilterPaneInteractor {
  defaultScope = '[data-test-filter-pane]';
}

@interactor class ExpandFilterPaneButton {
  defaultScope = '[data-test-expand-filter-pane-button]';
  click = clickable();
}

@interactor class CollapseFilterPaneButton {
  defaultScope = '[data-test-collapse-filter-pane-button]';
  click = clickable();
}

export default interactor(class SearchAndSortInteractor {
  defaultScope = '[data-test-search-and-sort]';
  collapseFilterPaneButton = new CollapseFilterPaneButton();
  expandFilterPaneButton = new ExpandFilterPaneButton();
  filterPane = new FilterPaneInteractor();
});

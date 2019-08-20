import {
  interactor,
  isPresent,
  fillable,
  clickable,
  collection,
  is,
  blurrable,
  text,
} from '@bigtest/interactor';

import MultiSelectInteractor from '@folio/stripes-components/lib/MultiSelection/tests/interactor';

class NoteTypeFilter extends MultiSelectInteractor {
  clear() { return this.click('button[icon="times"]'); }
}

@interactor class NotesModal {
  isDisplayed = isPresent('[data-test-notes-modal]');
  searchButtonIsDisabled = is('[data-test-notes-modal-search-button]', ':disabled');
  clickSearchButton = clickable('[data-test-notes-modal-search-button]');
  enterSearchQuery = fillable('[data-test-notes-modal-search-field]');
  searchQueryText = text('[data-test-notes-modal-search-field]');
  resetAll = clickable('[data-test-notes-modal-reset-all-button]');
  blurSearchInput = blurrable('[data-test-notes-modal-search-field]');
  emptyMessageIsDisplayed = isPresent('[class^="mclEmptyMessage"]');
  notesListIsDisplayed = isPresent('#notes-modal-notes-list');

  noteTypeFilter = new NoteTypeFilter('#noteTypeSelect');
  selectAssignedFilter = clickable('[data-test-checkbox-filter-data-option="assigned"');
  selectUnassignedFilter = clickable('[data-test-checkbox-filter-data-option="unassigned"');
  clickSaveButton = clickable('[data-test-notes-modal-save-button');
  clickAssignUnassignAllCheckbox = clickable('#clickable-list-column-assigning input');
  assignUnassignAllCheckboxIsDisabled = is('#clickable-list-column-assigning input', ':disabled');
  notes = collection('#notes-modal-notes-list [class^="mclRow---"]', {
    clickCheckbox: clickable('[class^="mclCell"]:first-child [data-test-notes-modal-assignment-checkbox]'),
    checkboxIsSelected: is('[class^="mclCell"]:first-child [data-test-notes-modal-assignment-checkbox]', ':checked'),
    checkboxIsDisabled: is('[class^="mclCell"]:first-child [data-test-notes-modal-assignment-checkbox]', ':disabled'),
  });

  performSearch(query) {
    return this.enterSearchQuery(query)
      .blurSearchInput();
  }
}

export default NotesModal;

import {
  interactor,
  isPresent,
  clickable,
  collection,
  isVisible,
  text,
} from '@bigtest/interactor';
import { isEmpty } from 'lodash';

@interactor class Button {
  isDisplayed = isVisible();
  click = clickable();
}

@interactor class NotesAccordion {
  isDisplayed = isPresent('#notes-accordion');
  assignButtonDisplayed = isPresent('[data-test-notes-accordion-assign-button]');
  newButtonDisplayed = isPresent('[data-test-notes-accordion-new-button]');
  clickAssignButton = clickable('[data-test-notes-accordion-assign-button]');
  clickNewButton = clickable('[data-test-notes-accordion-new-button]');

  newButton = new Button('[data-test-notes-accordion-new-button]');
  assignButton = new Button('[data-test-notes-accordion-assign-button]');

  notesListDisplayed = isPresent('#notes-list');
  notes = collection('#notes-list [class^="mclRow-"]', {
    click: clickable(),
    showMore: clickable('[data-test-note-show-more-button]'),
    showMoreButtonText: text('[data-test-note-show-more-button]'),
    edit: clickable('[data-test-note-edit-button]'),
    isShowMoreShown: isPresent('[data-test-note-show-more-button]'),
    isEditShown: isPresent('[data-test-note-edit-button]'),
    details: text('[data-test-note-details]'),
    date: text('[data-test-note-date]'),
    title: text('[data-test-note-title]'),
    type: text('[data-test-note-type]'),
  });

  noNotesMessagePresent = isPresent('[class^="mclEmptyMessage-"]');
  dateColumnHeading = new Button('#clickable-list-column-date');
  titleAndDetailsColumnHeading = new Button('#clickable-list-column-titleanddetails');
  typeColumnHeading = new Button('#clickable-list-column-type');

  whenNotesLoaded() {
    return this.when(() => !isEmpty(this.notes()));
  }
}

export default NotesAccordion;

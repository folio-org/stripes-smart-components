import {
  interactor,
  isPresent,
  clickable,
  collection,
  text,
  isVisible,
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
  clickCloseButton = clickable('[data-test-leave-note-view]');

  newButton = new Button('[data-test-notes-accordion-new-button]');
  assignButton = new Button('[data-test-notes-accordion-assign-button]');

  notesListDisplayed = isPresent('#notes-list');
  notes = collection('#notes-list [class^="mclRow-"]', {
    click: clickable(),
    title: text('[class^="mclCell":last-child]'),
  });

  whenNotesLoaded() {
    return this.when(() => !isEmpty(this.notes));
  }
}

export default NotesAccordion;

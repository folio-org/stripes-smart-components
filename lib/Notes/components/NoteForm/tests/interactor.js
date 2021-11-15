import {
  interactor,
  scoped,
  isPresent,
  clickable,
  text,
  blurrable,
  fillable,
  value,
  selectable,
  property,
} from '@bigtest/interactor';
import { dispatchFocusout } from '@folio/stripes-testing';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

import ReferredRecordInteractor from '../../ReferredRecord/tests/interactor';

const FormField = interactor(class FormField {
  enterText(string) {
    return this
      .fill(string);
  }

  focusout() {
    dispatchFocusout(this.$root);
  }

  fill = fillable();
  value = value();
});

const Select = interactor(class Select {
  selectOption = selectable();
  blur = blurrable();
  value = value();

  selectAndBlur(val) {
    return this
      .selectOption(val)
      .blur();
  }
});

const NoteDetailsField = interactor(class NoteDetailsField {
  value = text();
});


export default interactor(class NoteFormInteractor {
  static defaultScope = '#notes-form';

  assignedAccordion = new AccordionInteractor('#assigned');
  defaultReferredRecord = new ReferredRecordInteractor();
  insertedReferredRecord = scoped('[data-test-inserted-referred-record]');

  closeButton = scoped('[data-test-leave-note-form]', {
    click: clickable(),
  });

  saveButton = scoped('[data-test-save-note]', {
    click: clickable(),
    isDisabled: property('disabled'),
  });

  formFieldsAccordionIsDisplayed = isPresent('#noteForm');
  assignmentInformationAccordionIsDisplayed = isPresent('#assigned');
  noteTypesSelect = new Select('[data-test-note-types-field]');
  noteTitleField = new FormField('[data-test-note-title-field]');
  noteDetailsField = new NoteDetailsField('.ql-editor');
  hasTitleLengthError = isPresent('[data-test-character-limit-error="title"]');
  hasTitleMissingError = isPresent('[data-test-title-missing-error]');
  navigationModalIsOpened = isPresent('#navigation-modal');
  clickCancelNavigationButton = clickable('[data-test-navigation-modal-dismiss]');
  clickContinueNavigationButton = clickable('[data-test-navigation-modal-continue]');
  referredEntityType = text('[data-test-referred-entity-type]');
  referredEntityName = text('[data-test-referred-entity-name]');
  clickCancelButton = clickable('[data-test-cancel-editing-note-form]');
  assignmentAccordion = new AccordionInteractor('#assigned');

  popupOnCheckoutField = scoped('[data-test-note-popup-on-checkout-field]', {
    click: clickable(),
  });

  popupOnUsersField = scoped('[data-test-note-popup-on-users-field]', {
    click: clickable(),
  });

  enterNoteData(noteType, noteTitle) {
    return this.noteTypesSelect.selectAndBlur(noteType)
      .noteTitleField.enterText(noteTitle);
  }
});

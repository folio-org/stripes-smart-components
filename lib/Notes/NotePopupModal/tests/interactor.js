import {
  interactor,
  isPresent,
  scoped,
  clickable,
  attribute,
  text,
  focusable,
} from '@bigtest/interactor';

import ModalInteractor from '@folio/stripes-components/lib/Modal/tests/interactor';

export default interactor(class NotePopupModal {
  modal = new ModalInteractor('#popup-note-modal');
  closeButton = scoped('[data-test-note-popup-modal-close-button]', {
    click: clickable(),
  });

  deleteButton = scoped('[data-test-note-popup-modal-delete-button]', {
    click: clickable(),
    disabled: attribute('disabled'),
  });

  noteContent = text('[data-test-note-popup-modal-content]');

  focus = focusable();

  whenLoaded() {
    return this.when(() => isPresent('#popup-note-modal'));
  }
});

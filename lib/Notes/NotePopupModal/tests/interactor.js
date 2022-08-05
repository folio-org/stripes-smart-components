import {
  interactor,
  isPresent,
  scoped,
  clickable,
  attribute,
  text,
  triggerable,
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

  pressEscape = triggerable('#popup-note-modal', 'keypress', {
    bubbles: true,
    cancelable: true,
    keyCode: 27,
    key: 'Escape',
  });

  whenLoaded() {
    return this.when(() => isPresent('#popup-note-modal'));
  }
});

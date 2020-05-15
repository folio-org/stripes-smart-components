import {
  interactor,
  isPresent,
  collection,
  clickable,
  property,
} from '@bigtest/interactor';

import ModalInteractor from '@folio/stripes-components/lib/Modal/tests/interactor';

export default interactor(class DeleteModalInteractor {
  modal = new ModalInteractor('[data-test-delete-custom-fields-modal]');
  loadingIconIsPresent = isPresent('#custom-fields-statistics-loading-icon');

  warningMessages = collection('[data-test-custom-field-delete-warning]');
  confirm = clickable('[data-test-delete-modal-confirm-button]');
  cancel = clickable('[data-test-delete-modal-cancel-button]');
  confirmDisabled = property('[data-test-delete-modal-confirm-button]', 'disabled');
  cancelDisabled = property('[data-test-delete-modal-cancel-button]', 'disabled');

  whenLoaded() {
    return this.when(() => !this.loadingIconIsPresent);
  }
});

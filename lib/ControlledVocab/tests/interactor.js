import {
  blurrable,
  clickable,
  fillable,
  focusable,
  interactor,
  property,
  text,
  isPresent,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor';
import { TextField as TextFieldInteractor } from '@folio/stripes-testing';

export default interactor(class ControlledVocabInteractor {
  newButton = clickable('#clickable-add-institutions');
  hasNewButton = isPresent('#clickable-add-institutions');
  disabledNewButton = property('#clickable-add-institutions', 'disabled');
  inputField = TextFieldInteractor('name 0');
  hasInputField = isPresent('input[name="items[0].name"]');

  fillInputField(value) {
    this.inputField.focus();
    return this.inputField.fillIn(value).then(this.inputField.blur());
  }

  editButton = new ButtonInteractor('#clickable-edit-institutions-0');
  hasEditButton = isPresent('#clickable-edit-institutions-0');
  disabledEditButton = property('#clickable-edit-institutions-1', 'disabled');
  hasDeleteButton = isPresent('#clickable-delete-institutions-0');
  disabledDeleteButton = property('#clickable-delete-institutions-1', 'disabled');
  saveButton = clickable('#clickable-save-institutions-0');
  hasSaveButton = isPresent('#clickable-save-institutions-0');
  disabledSaveButton = property('#clickable-save-institutions-0', 'disabled');
  cancelButton = clickable('#clickable-cancel-institutions-0');
  hasCancelButton = isPresent('#clickable-cancel-institutions-0');
  commonErrors = text('[data-test-common-errors]');
  hasActionsColumn = isPresent('#list-column-actions');
  rowCount = 5;
});

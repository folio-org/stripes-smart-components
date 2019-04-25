import {
  blurrable,
  count,
  clickable,
  collection,
  fillable,
  focusable,
  interactor,
  is,
  property,
  text
} from '@bigtest/interactor';

const DataOption = interactor(class DataOptionInteractor {
  click = clickable();
  isSelected = is('[checked]');
  isDisabled = is('disabled');
  isReadOnly = is('readonly')
});

export default interactor(class ControlledVocabInteractor {
  dataOptionsCount = count('[data-test-checkbox-filter-data-option]');
  dataOptions = collection('[data-test-checkbox-filter-data-option]', DataOption);

  newButton = clickable('#clickable-add-institutions');
  inputField = fillable('input[name="items[0].name"]');
  blurInputField = blurrable('input[name="items[0].name"]');
  focusInputField = focusable('input[name="items[0].name"]');

  fillInputField(value) {
    return this.focusInputField().inputField(value).blurInputField();
  }

  saveButton = clickable('#clickable-save-institutions-0');
  disabledSaveButton = property('#clickable-save-institutions-0', 'disabled');
  cancelButton = clickable('#clickable-cancel-institutions-0');
  emptyFieldError = text('#editList-institutions div[aria-rowindex="2"] div[role="alert"]')

  rowCount = 5;
});

import {
  interactor,
  fillable,
  value,
  blurrable,
  clickable,
  is,
  text,
  collection,
  isPresent,
} from '@bigtest/interactor';

import AddButtonInteractor from '../../../components/CustomFieldsForm/components/AddButton/tests/interactor';
import DeleteModalInteractor from '../../../components/CustomFieldsForm/components/DeleteModal/tests/interactor';

export default interactor(class EditCustomFieldsSettings {
  sectionTitleInput = fillable('[data-test-custom-fields-section-title]');
  sectionTitleBlur = blurrable('[data-test-custom-fields-section-title]');
  sectionTitleValue = value('[data-test-custom-fields-section-title]');
  sectionTitleFillAndBlur(sectionTitle) {
    return this.sectionTitleInput(sectionTitle).sectionTitleBlur();
  }

  save = clickable('[data-test-custom-fields-save-button]');
  saveButtonDisabled = is('[data-test-custom-fields-save-button]', ':disabled');
  cancel = clickable('[data-test-custom-fields-cancel-button]');
  cancelButtonDisabled = is('[data-test-custom-fields-cancel-button]', ':disabled');

  errorMessage = text('[data-test-callout-element]');

  customFields = collection('[data-test-accordion-section]', {
    delete: clickable('[data-test-custom-field-delete-button]'),
    fillName: fillable('[data-test-custom-fields-name-input]'),
    fillHelpText: fillable('[data-test-custom-fields-help-text-input]'),
    checkHidden: clickable('[data-test-custom-fields-hidden-checkbox]'),
    checkRequired: clickable('[data-test-custom-fields-required-checkbox]'),
    options: collection('[class^="mclRow--"]', {
      fillOptionName: fillable('input[type="text"]'),
      delete: clickable('[data-test-delete-option]'),
      deleteButtonIsDisplayed: isPresent('[data-test-delete-option]'),
    }),
    addOption: clickable('[data-test-custom-fields-add-option-button]')
  });

  areCustomFieldsPresent = isPresent('[data-test-accordion-section]');
  addFieldButton = new AddButtonInteractor();
  deleteModal = new DeleteModalInteractor();

  whenLoaded() {
    return this.when(() => this.areCustomFieldsPresent, 5000);
  }
});

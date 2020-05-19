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
import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';
import DeleteModalInteractor from '../../../components/CustomFieldsForm/components/DeleteModal/tests/interactor';

export default interactor(class EditCustomFieldsSettings {
  sectionTitleInput = fillable('[data-test-custom-fields-section-title]');
  sectionTitleBlur = blurrable('[data-test-custom-fields-section-title]');
  sectionTitleValue = value('[data-test-custom-fields-section-title]');
  sectionTitleFillAndBlur(value) {
    return this.sectionTitleInput(value).sectionTitleBlur();
  }

  save = clickable('[data-test-custom-fields-save-button]');
  saveButtonDisabled = is('[data-test-custom-fields-save-button]', ':disabled');
  cancel = clickable('[data-test-custom-fields-cancel-button]');
  cancelButtonDisabled = is('[data-test-custom-fields-cancel-button]', ':disabled');

  errorMessage = text('[data-test-callout-element]');

  customFields = collection('[data-test-accordion-section]', {
    delete: clickable('[data-test-custom-field-delete-button]'),
  });

  addFieldButton = new AddButtonInteractor();
  deleteModal = new DeleteModalInteractor();
});

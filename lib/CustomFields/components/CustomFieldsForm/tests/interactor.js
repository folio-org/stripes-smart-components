import {
  interactor,
  isPresent,
  collection,
  value,
  fillable,
  focusable,
  blurrable,
  clickable,
  is,
} from '@bigtest/interactor';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';
import AddButtonInteractor from '../components/AddButton/tests/interactor';

export default interactor(class CustomFieldsFormInteractor {
  sectionTitleValue = value('[data-test-custom-fields-section-title]');
  sectionTitleField = fillable('[data-test-custom-fields-section-title]');
  focusSectionTitle = focusable('[data-test-custom-fields-section-title]');
  blurSectionTitle = blurrable('[data-test-custom-fields-section-title]');

  fillSectionTitle(value) {
    return this.focusSectionTitle().sectionTitleField(value).blurSectionTitle();
  }

  clickSaveButton = clickable('[data-test-custom-fields-save-button]');
  saveButtonIsDisabled = is('[data-test-custom-fields-save-button]', ':disabled');
  clickCancelButton = clickable('[data-test-custom-fields-cancel-button]');
  cancelButtonIsDisabled = is('[data-test-custom-fields-cancel-button]', ':disabled');

  addButton = new AddButtonInteractor();
  customFieldAccordions = collection('[data-test-accordion-section]', AccordionInteractor);
});

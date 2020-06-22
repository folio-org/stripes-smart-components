import {
  interactor,
  isPresent,
  collection,
} from '@bigtest/interactor';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

export default interactor(class EditCustomFieldsRecord {
  accordion = new AccordionInteractor('#test-accordion-id');
  accordionIsPresent = isPresent('#test-accordion-id');

  customFields = collection('[data-test-record-edit-custom-field]');
  loadingIconIsPresent = isPresent('[data-test-custom-fields-loading-icon]');

  whenCustomFieldsLoaded() {
    return this.when(() => !this.loadingIconIsPresent);
  }
});

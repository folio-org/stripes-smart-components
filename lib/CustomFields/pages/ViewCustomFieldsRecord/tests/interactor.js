import {
  interactor,
  text,
  collection,
  isPresent,
} from '@bigtest/interactor';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

export default interactor(class ViewCustomFieldsRecord {
  accordion = new AccordionInteractor('#some-accordion-id');

  fields = collection('[data-test-col-custom-field]', {
    label: text('[class^='),
    value: text('[data-test-kv-value]'),
  });

  whenFieldsAreVisible() {
    return this.when(() => this.fields().length > 0);
  }

  whenLoaded() {
    return this.when(() => isPresent('[data-test-custom-fields-view-accordion]'));
  }
});

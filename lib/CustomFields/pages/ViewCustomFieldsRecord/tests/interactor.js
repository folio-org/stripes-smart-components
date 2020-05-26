import {
  interactor,
  text,
  collection,
} from '@bigtest/interactor';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

export default interactor(class ViewCustomFieldsRecord {
  accordion = new AccordionInteractor('#some-accordion-id');

  fields = collection('[data-test-col-custom-field]', {
    label: text('[class^='),
    value: text('[data-test-kv-value]'),
  });
});

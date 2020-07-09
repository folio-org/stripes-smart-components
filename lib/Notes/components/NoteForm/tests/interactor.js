import {
  interactor,
  scoped,
} from '@bigtest/interactor';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

import ReferredRecordInteractor from '../../ReferredRecord/tests/interactor';

export default interactor(class NoteFormInteractor {
  static defaultScope = '#notes-form';

  assignedAccordion = new AccordionInteractor('#assigned');
  defaultReferredRecord = new ReferredRecordInteractor();
  insertedReferredRecord = scoped('[data-test-inserted-referred-record]');
});

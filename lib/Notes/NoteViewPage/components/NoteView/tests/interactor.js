import {
  interactor,
  scoped,
} from '@bigtest/interactor';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

import ReferredRecordInteractor from '../../../../components/ReferredRecord/tests/interactor';

export default interactor(class NoteViewInteractor {
  static defaultScope = '[data-test-note-view]';

  assignedAccordion = new AccordionInteractor('#assigned');
  defaultReferredRecord = new ReferredRecordInteractor();
  insertedReferredRecord = scoped('[data-test-inserted-referred-record]');
});

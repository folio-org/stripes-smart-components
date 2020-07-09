import {
  interactor,
  scoped,
  clickable,
} from '@bigtest/interactor';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';
import MetaSectionInteractor from '@folio/stripes-components/lib/MetaSection/tests/interactor';

import ReferredRecordInteractor from '../../../../components/ReferredRecord/tests/interactor';

export default interactor(class NoteViewInteractor {
  static defaultScope = '[data-test-note-view]';

  assignedAccordion = new AccordionInteractor('#assigned');
  defaultReferredRecord = new ReferredRecordInteractor();
  insertedReferredRecord = scoped('[data-test-inserted-referred-record]');
  clickCloseNoteView = clickable('[data-test-leave-note-view]');
  clickDeleteNote = clickable('[data-test-note-delete]');
  clickUnassignNote = clickable('[data-test-note-unassign]');
  metaSection = new MetaSectionInteractor();
});

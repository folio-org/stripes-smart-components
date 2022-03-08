import {
  interactor,
  scoped,
  clickable,
  text,
  isPresent
} from '@bigtest/interactor';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';
import { MetaSectionInteractor } from '@folio/stripes-components/lib/MetaSection/tests/interactor';
import NoValueInteractor from '@folio/stripes-components/lib/NoValue/tests/interactor';

import ReferredRecordInteractor from '../../../../components/ReferredRecord/tests/interactor';

export default interactor(class NoteViewInteractor {
  static defaultScope = '[data-test-note-view]';

  assignedAccordion = new AccordionInteractor('#assigned');
  defaultReferredRecord = new ReferredRecordInteractor();
  insertedReferredRecord = scoped('[data-test-inserted-referred-record]');
  clickCloseNoteView = clickable('[data-test-leave-note-view]');
  clickDeleteNote = clickable('[data-test-note-delete]');
  clickUnassignNote = clickable('[data-test-note-unassign]');
  noteType = text('[data-test-note-view-note-type]');
  noteTitle = text('[data-test-note-view-note-title]');
  metaSection = MetaSectionInteractor();
  hasEmptyNoteType = isPresent(`[data-test-note-view-note-type] ${NoValueInteractor.defaultScope}`);
  hasEmptyNoteTitle = isPresent(`[data-test-note-view-note-title] ${NoValueInteractor.defaultScope}`);
});

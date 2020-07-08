import { interactor } from '@bigtest/interactor';

import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor';

import NoteViewInteractor from '../components/NoteView/tests/interactor';

export default interactor(class NoteViewPageInteractor {
  noteView = new NoteViewInteractor();
  confirmDeleteModal = new ConfirmationModalInteractor('#confirm-delete-note');
  confirmUnassignModal = new ConfirmationModalInteractor('#confirm-unassign-note');

  whenLoaded() {
    return this.when(() => this.noteView.isPresent);
  }
});

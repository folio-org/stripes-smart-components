import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

import NoteForm from '../../components/NoteForm/tests/interactor';

export default interactor(class NoteEditPage {
  noteForm = new NoteForm();

  whenLoaded() {
    return this.when(() => isPresent('#notes-form'));
  }
});

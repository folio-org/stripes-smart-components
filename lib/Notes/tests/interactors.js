import {
  IconButton,
  HTML,
  Select,
  TextField,
  including,
  Keyboard,
  axeModuleConfig
} from '@folio/stripes-testing';

export const nonQuillAxeConfig = { rootNode: { exclude: ['.quill'] }, config: axeModuleConfig };

// used by [contenteditable] to update value of quill editor.
function fillValueContent(el, letter) {
  el.querySelector('p').innerText += letter;
}

export const NoteCreatePageInteractor = HTML.extend('Note create form interactor');

export const ContentEditableField = HTML.extend('content-editable div')
  .selector('[contenteditable]')
  .filters({
    value: el => el.innerText
  })
  .actions({
    focus: async ({ perform }) => { await perform(el => el.focus()); },
    fillIn: async ({ perform }, value) => {
      await perform(el => el.focus());
      for (const letter of value) {
        await Keyboard.pressKey(letter);
        await perform(el => fillValueContent(el, letter));
      }
      await perform(el => el.blur());
    }
  });

export const NoteCreateFormInteractor = HTML.extend('Note create form')
  .selector('#notes-form')
  .actions({
    clickClose: async ({ find }) => { await find(IconButton({ icon: 'times' })).click(); },
    fillNoteTitle: async ({ find }, value) => { await find(TextField(including('title'))).fillIn(value); },
    setNoteType: async ({ find }, type) => { await find(Select(including('type'))).choose(type); },
    fillNoteData: async ({ find }, value) => {
      await find(ContentEditableField()).focus();
      await find(ContentEditableField()).fillIn(value);
    }
  });

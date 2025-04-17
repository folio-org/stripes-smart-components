import {
  Accordion,
  Button,
  Checkbox,
  IconButton,
  HTML,
  Modal,
  MultiColumnList,
  Select,
  TextField,
  including,
  Keyboard,
  axeModuleConfig,
  MultiSelect,
  MultiColumnListRow
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

export const NoteSmartAccordionInteractor = Accordion.extend('notes accordion')
  .filters({
    noteCount: MultiColumnList().rowCount(),
    newButton: Button('New').exists(),
    assignButton: Button(including('Assign')).exists(),
  })
  .actions({
    clickNew: ({ find }) => find(Button('New')).click(),
    clickNote: ({ find }, index) => find(MultiColumnListRow({ index })).click(),
    clickAssign: ({ find }) => find(Button(including('Assign'))).click(),
  });

// contents of Notes Assign modal and for Notes Smart Accordion

export const NoteDetailsInteractor = HTML.extend('Note details')
  .selector('[data-test-note-details]')
  .filters({
    textLength: el => el.innerText.length
  });

export const NoteItemInteractor = MultiColumnListRow.extend('note row')
  .filters({
    checkboxSelected: Checkbox({ checked: true }).exists(),
    checkboxDisabled: Checkbox({ disabled: true }).exists(),
    showMoreDisplayed: Button('Show more').exists(),
    showLessDisplayed: Button('Show less').exists(),
    editDisplayed: Button('Edit').exists(),
    detailsLength: NoteDetailsInteractor().textLength(),
  })
  .actions({
    clickCheckbox: ({ find }) => find(Checkbox()).click(),
    clickEdit: ({ find }) => find(Button('Edit')).click(),
    clickShowMore: ({ find }) => find(Button('Show more')).click(),
  });

export const NotesModalInteractor = Modal.extend('Notes modal')
  .selector('[data-test-notes-modal]')
  .filters({
    searchDisabled: Button({ text: 'Search', disabled: true }).exists(),
    searchText: TextField('Note search').value(),
    emptyMessage: el => Boolean(el.querySelector('[class^=mclEmptyMessage-]')),
    noteCount: MultiColumnList().rowCount(),
  })
  .actions({
    clickAssignedFilter: ({ find }) => find(Checkbox('Assigned')).click(),
    clickUnassignedFilter: ({ find }) => find(Checkbox('Unassigned')).click(),
    clickSave: ({ find }) => find(Button('Save')).click(),
    fillSearch: ({ find }, value) => find(TextField('Note search')).fillIn(value),
    clickSearch: ({ find }) => find(Button('Search')).click(),
    clickAssignAll: ({ find }) => find(Checkbox({ ariaLabel: 'Assign / Unassign all notes' })).click(),
    clickResetAll: ({ find }) => find(Button(including('Reset'))).click(),
    chooseTypeOption: ({ find }, value) => find(MultiSelect('Note type')).choose(value),
    clearTypeFilter: ({ find }) => find(Accordion('Note type')).find(IconButton({ ariaLabel: 'Reset' })).click(),
  });

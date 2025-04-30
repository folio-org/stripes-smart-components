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

/* Programmatically change a field value and trigger the onChange event so that external state can be updated...
*  elem - reference object
*  value - new value for the field.
*/

function deletePropertySafe(elem, prop) {
  const desc = Object.getOwnPropertyDescriptor(elem, prop);
  if (desc && desc.configurable) {
    delete elem[prop];
  }
}

// Standard TextField().fillIn can take a long time to execute if the input is > 400 letters.
// this function focuses, sets the value of the input directly and triggers a 'change', then a blur...
function fillInLongValue(node, value = '') {
  let event;
  node.focus();
  // grab the whole current descriptor for value (set and all...);
  const descriptor = Object.getOwnPropertyDescriptor(node, 'value');

  const initialValue = node.value;
  node.value = initialValue + '#';
  deletePropertySafe(node, 'value');
  node.value = value;

  event = new Event('propertychange', { bubbles: false, cancelable: false });
  event.propertyName = 'value';
  node.dispatchEvent(event);

  event = new Event('input', { bubbles: true, cancelable: false });
  node.dispatchEvent(event);

  // Restore artificial value property descriptor.
  if (descriptor) {
    Object.defineProperty(node, 'value', descriptor);
  }

  node.blur();
}

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
    fillNoteTitle: async ({ find }, value) => {
      if (value.length > 200) {
        await find(TextField(including('title'))).perform(
          el => {
            fillInLongValue(el.querySelector('input'), value);
          }
        );
      } else {
        await find(TextField(including('title'))).fillIn(value);
      }
    },
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

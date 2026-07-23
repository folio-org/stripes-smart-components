import {
  Accordion,
  Button,
  Dropdown,
  DropdownMenu,
  HTML,
  Keyboard,
  KeyValue,
  Modal,
  MultiColumnListCell,
  MultiColumnListRow,
  TextField,
  including,
  isVisible,
} from '@folio/stripes-testing';

export {
  RadioButton as CFDefaultRadioButton,
  Checkbox as CFOptionCheckbox,
} from '@folio/stripes-testing';

// custom field add control
export const CFAddMenuInteractor = DropdownMenu.extend('custom fields add menu')
  .filters({
    itemLabels:  el => [...el.querySelectorAll('button')].map((b) => b.textContent),
  });

// custom field accordion contents
// contains option fields in an MCL and keyvalue pairs representing help text.
// below grid messages for CF options settings
export const CFOptionsMessageInteractor = HTML.extend('option fields message')
  .selector('[class^=optionsLeftMessage]');

export const CFMaxOptionsMessageInteractor = HTML.extend('max options message')
  .selector('[class^=maxOptionsNumberReached]');

export const CFContainer = HTML.extend('custom fields container')
  .selector('#ui-dummy-module-display')
  .filters({
    fieldCount: (el) => el.querySelectorAll('[data-test-col-custom-field]').length,
  });

export const CFKeyValueInteractor = KeyValue.extend('view custom fields keyValue')
  .filters({
    label: (el) => el.querySelector('[class^=kvLabel]').textContent,
    visible: {
      apply: el => isVisible(el),
      default: true
    },
    index: el => {
      const region = el.closest('[class^=content-region-]');
      const keyvalues = [...region.querySelectorAll('[class^=kvRoot--]')];

      return keyvalues.findIndex(k => k === el);
    }
  });

export const CFSettingsCellInteractor = MultiColumnListCell.extend('custom fields MCL cell')
  .filters({
    visible: {
      apply: (el) => isVisible(el),
      default: true
    }
  });

export const CFSettingsRowInteractor = MultiColumnListRow.extend('custom fields MCL cell')
  .filters({
    visible: {
      apply: (el) => isVisible(el),
      default: true
    }
  })
  .actions({
    fillLabel: ({ find }, value) => find(TextField()).fillIn(value),
    clickTrash: ({ find }) => find(Button({ ariaLabel: 'trash' })).click(),
  });

// end custom field accordion content interactors.


// custom field draggable accordion
export const CFAccordionInteractor = Accordion.extend('draggable custom field accordion')
  .selector('[data-test-accordion-section]')
  .filters({
    deleteButtonCount: (el) => [...el.querySelector('[class*=content]').querySelectorAll('button[aria-label=trash]')].length,
    index: (el) => {
      // collect elements from document, and sort by dom rect.
      const accordions = [...document.querySelectorAll('[data-test-accordion-section]')];

      accordions.sort((a, b) => {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
      });

      for (let i = 0; i < accordions.length; i++) {
        if (el === accordions[i]) {
          return i;
        }
      }

      return undefined;
    },
    count: () => document.querySelectorAll('[data-test-accordion-section]').length,
  })
  .actions({
    moveDown: async ({ perform }) => {
      await perform((el) => {
        el.querySelector('[class^=defaultCollapse]').focus();
      });
      await Keyboard.space();
      await perform((el) => {
        el.querySelector('[class^=defaultCollapse]').focus();
      });
      await Keyboard.arrowDown();
      await Keyboard.space();
    },
    moveUp: async ({ perform }) => {
      await perform(async (el) => {
        el.querySelector('[class^=defaultCollapse]').focus();
      });
      await Keyboard.space();
      await perform((el) => {
        el.querySelector('[class^=defaultCollapse]').focus();
      });
      await Keyboard.arrowUp();
      await Keyboard.space();
    },
    clickHeader: async ({ perform }) => { await perform((el) => el.querySelector('[class^=labelArea-]').click()); },
    deleteOption: async ({ find }, index) => { await find(MultiColumnListRow({ index })).find(Button({ ariaLabel: 'trash' })).click(); },
    addOption: async ({ find }) => find(Button('Add option')).click(),
    deleteCustomField: async ({ perform }) => { await perform((el) => el.querySelector('[class^=headerWrapper]').querySelector('button[aria-label=trash]').click()); },
    fillHelpText: async ({ find }, value) => find(TextField('Help text')).fillIn(value),
  });

// custom field delete modal
export const CFDeleteModalInteractor = Modal.extend('custom field delete modal')
  .filters({
    warningCount: el => [...el.querySelectorAll('[data-test-custom-field-option-delete-warning]')].length,
    fieldWarningCount: el => [...el.querySelectorAll('[data-test-custom-field-delete-warning]')].length
  })
  .actions({
    clickSave: ({ find }) => find(Button(including('Save'))).click(),
    clickCancel: ({ find }) => find(Button(including('Cancel'))).click()
  });


// custom field view page
export const CustomFieldsPageInteractor = HTML.extend('Custom fields page')
  .selector('#custom-fields-pane')
  .filters({
    count: () => document.querySelectorAll('[data-test-accordion-section]').length,
  });


// custom field settings form page
export const CustomFieldsFormInteractor = CustomFieldsPageInteractor.extend('Custom fields settings form')
  .selector('form[class^=custom-')
  .actions({
    addField: async ({ find }, fieldType) => {
      const addDropdown = await find(Dropdown(including('Add')));
      await addDropdown.open();
      await addDropdown.choose(fieldType);
    },
    clickCancel: ({ find }) => find(Button(including('Cancel'))).click(),
    clickSave: ({ find }) => find(Button(including('Save'))).click(),
  });

// custom field rendered form
export const CustomFieldsRecordForm = Accordion.extend('Custom fields record form')
  .filters({
    fieldCount: (el) => el.querySelectorAll('[data-test-record-edit-custom-field]').length,
  });

// custom field rendered read-only record
export const CustomFieldRecordViewInteractor = Accordion.extend('view custom field accordion')
  .filters({
    fieldCount: el => [...el.querySelectorAll('[class^=kvRoot--]')].length
  });

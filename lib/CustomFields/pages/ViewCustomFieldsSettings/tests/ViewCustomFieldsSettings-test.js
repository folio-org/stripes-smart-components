import React from 'react';
import { describe, beforeEach, it } from 'mocha';

import {
  Accordion,
  Checkbox,
  KeyValue,
  isVisible,
  MultiColumnListCell,
  MultiColumnListRow,
  RadioButton,
  runAxeTest,
} from '@folio/stripes-testing';

import {
  mount,
  setupApplication,
} from '../../../../../tests/helpers';

import ViewCustomFieldsSettings from '../ViewCustomFieldsSettings';
// import ViewCustomFieldsSettingsInteractor from './interactor';

const CustomFieldsAccordionInteractor = Accordion.extend('custom fields accordion')
  .selector('[class^=accordion--]')
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
    clickHeader: async ({ perform }) => { await perform((el) => el.querySelector('[class^=labelArea-]').click()); },
    deleteOption: async ({ find }, index) => { await find(MultiColumnListRow({ index })).find(Button({ ariaLabel: 'trash' })).click(); },
    deleteCustomField: async ({ perform }) => { await perform((el) => el.querySelector('[class^=headerWrapper]').querySelector('button[aria-label=trash]').click()); },
  });

const ViewCFSettingsKeyValueInteractor = KeyValue.extend('view custom fields keyValue')
  .filters({
    label: (el) => el.querySelector('[class^=kvLabel]').textContent,
    visible: {
      apply: el => isVisible(el),
      default: true
    }
  });

const ViewCFSettingsCellInteractor = MultiColumnListCell.extend('custom fields MCL cell')
  .filters({
    visible: {
      apply: (el) => isVisible(el),
      default: true
    }
  });

const ViewCFSettingsRowInteractor = MultiColumnListRow.extend('custom fields MCL cell')
  .filters({
    visible: {
      apply: (el) => isVisible(el),
      default: true
    }
  });

describe('ViewCustomFieldsSettings', () => {
  setupApplication();

  const renderComponent = (props = {}) => {
    return mount(
      <ViewCustomFieldsSettings
        backendModuleName="users-test"
        editRoute="/custom-fields-edit"
        entityType="user"
        permissions={{
          canView: true,
          canEdit: true,
          canDelete: true,
        }}
        {...props}
      />
    );
  };

  beforeEach(async () => {
    await renderComponent();
  });

  it('should not have any a11y issues', () => runAxeTest());

  describe('when a custom field has help text', () => {
    beforeEach(async () => {
      await CustomFieldsAccordionInteractor({ index: 0}).clickHeader();
    });

    it('should show help text value', () => ViewCFSettingsKeyValueInteractor('Help text').has({ value: 'helpful text' }));
  });

  describe('when a custom field does not have help text', () => {
    beforeEach(async () => {
      await CustomFieldsAccordionInteractor({ index: 1 }).clickHeader();
    });
    it('should not show help text section', () => ViewCFSettingsKeyValueInteractor('Help text').absent());
  });

  describe('when a custom field is required', () => {
    beforeEach(async () => {
      await CustomFieldsAccordionInteractor({ index: 0 }).clickHeader();
    });

    it('should show "Yes" under "Required" field', () => ViewCFSettingsKeyValueInteractor({ label: 'Required' }).has({ value: 'Yes' }));
  });

  describe('when a custom field is not required', () => {
    beforeEach(async () => {
      await CustomFieldsAccordionInteractor({ index: 1 }).clickHeader();
    });

    it('should show "No" under "Required" field', () => ViewCFSettingsKeyValueInteractor({ label: 'Required' }).has({ value: 'No' }));
  });

  describe('when custom field is single select', () => {
    beforeEach(async () => {
      await CustomFieldsAccordionInteractor({ index: 2 }).clickHeader();
    });

    it('should display available options list', () => Promise.all([
      ViewCFSettingsCellInteractor({ row: 0, column: 'Label' }).has({ content: 'option 1' }),
      ViewCFSettingsCellInteractor({ row: 1, column: 'Label' }).has({ content: 'option 2' }),
    ]));

    it('should check default option', () => ViewCFSettingsRowInteractor({ index: 0 }).find(RadioButton({ disabled: true })).is({ disabled: true, checked: true }));

    it('should disable checkboxes', () => CustomFieldsAccordionInteractor({ index: 2 }).find(RadioButton({ disabled: false })).absent());
  });

  describe('when custom field is multi select', () => {
    beforeEach(async () => {
      await CustomFieldsAccordionInteractor({ index: 3 }).clickHeader();
    });

    it('should display available options list', () => Promise.all([
      ViewCFSettingsCellInteractor({ row: 0, column: 'Label' }).has({ content: 'option 1' }),
      ViewCFSettingsCellInteractor({ row: 1, column: 'Label' }).has({ content: 'option 2' }),
      ViewCFSettingsCellInteractor({ row: 2, column: 'Label' }).has({ content: 'option 3' }),
    ]));

    it('should disable and check appropriate checkboxes', () => Promise.all([
      ViewCFSettingsRowInteractor({ index: 0 }).find(Checkbox({ disabled: true })).is({ disabled: true, checked: true }),
      ViewCFSettingsRowInteractor({ index: 1 }).find(Checkbox({ disabled: true })).is({ disabled: true, checked: true }),
      ViewCFSettingsRowInteractor({ index: 2 }).find(Checkbox({ disabled: true })).is({ disabled: true, checked: false })
    ]));
  });

  describe('when custom field is radiobutton set', () => {
    beforeEach(async () => {
      await CustomFieldsAccordionInteractor({ index: 4 }).clickHeader();
    });

    it('should display available options list', () => Promise.all([
      ViewCFSettingsCellInteractor({ row: 0, column: 'Label' }).has({ content: 'option 1' }),
      ViewCFSettingsCellInteractor({ row: 1, column: 'Label' }).has({ content: 'option 2' }),
    ]));

    it('should disable and check appropriate checkboxes', () => Promise.all([
      ViewCFSettingsRowInteractor({ index: 0 }).find(RadioButton({ disabled: true })).is({ disabled: true, checked: true }),
      ViewCFSettingsRowInteractor({ index: 1 }).find(RadioButton({ disabled: true })).is({ disabled: true, checked: false }),
    ]));
  });

  describe('when custom field is checkbox', () => {
    beforeEach(async () => {
      await CustomFieldsAccordionInteractor({ index: 6 }).clickHeader();
    });

    it('should display checkbox name', () => ViewCFSettingsKeyValueInteractor('Field label').has({ value: 'Checkbox' }));

    it('should show help text section', () => ViewCFSettingsKeyValueInteractor('Help text').has({ value: 'checkbox help text' }));
  });
});

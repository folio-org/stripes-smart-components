import React from 'react';
import { describe, beforeEach, it } from 'mocha';

import {
  runAxeTest,
} from '@folio/stripes-testing';

import {
  mount,
  setupApplication,
} from '../../../../../tests/helpers';

import {
  CFAccordionInteractor,
  CFKeyValueInteractor,
  CFSettingsCellInteractor,
  CFSettingsRowInteractor,
  CFDefaultRadioButton,
  CFOptionCheckbox,
} from '../../../tests/interactors';

import ViewCustomFieldsSettings from '../ViewCustomFieldsSettings';

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
      await CFAccordionInteractor({ index: 0 }).clickHeader();
    });

    it('should show help text value', () => CFKeyValueInteractor('Help text').has({ value: 'helpful text' }));
  });

  describe('when a custom field does not have help text', () => {
    beforeEach(async () => {
      await CFAccordionInteractor({ index: 1 }).clickHeader();
    });
    it('should not show help text section', () => CFKeyValueInteractor('Help text').absent());
  });

  describe('when a custom field is required', () => {
    beforeEach(async () => {
      await CFAccordionInteractor({ index: 0 }).clickHeader();
    });

    it('should show "Yes" under "Required" field', () => CFKeyValueInteractor({ label: 'Required' }).has({ value: 'Yes' }));
  });

  describe('when a custom field is not required', () => {
    beforeEach(async () => {
      await CFAccordionInteractor({ index: 1 }).clickHeader();
    });

    it('should show "No" under "Required" field', () => CFKeyValueInteractor({ label: 'Required' }).has({ value: 'No' }));
  });

  describe('when custom field is single select', () => {
    beforeEach(async () => {
      await CFAccordionInteractor({ index: 2 }).clickHeader();
    });

    it('should display available options list', () => Promise.all([
      CFSettingsCellInteractor({ row: 0, column: 'Label' }).has({ content: 'option 1' }),
      CFSettingsCellInteractor({ row: 1, column: 'Label' }).has({ content: 'option 2' }),
    ]));

    it('should check default option', () => CFSettingsRowInteractor({ index: 0 }).find(CFDefaultRadioButton({ disabled: true })).is({ disabled: true, checked: true }));

    it('should disable checkboxes', () => CFAccordionInteractor({ index: 2 }).find(CFDefaultRadioButton({ disabled: false })).absent());
  });

  describe('when custom field is multi select', () => {
    beforeEach(async () => {
      await CFAccordionInteractor({ index: 3 }).clickHeader();
    });

    it('should display available options list', () => Promise.all([
      CFSettingsCellInteractor({ row: 0, column: 'Label' }).has({ content: 'option 1' }),
      CFSettingsCellInteractor({ row: 1, column: 'Label' }).has({ content: 'option 2' }),
      CFSettingsCellInteractor({ row: 2, column: 'Label' }).has({ content: 'option 3' }),
    ]));

    it('should disable and check appropriate checkboxes', () => Promise.all([
      CFSettingsRowInteractor({ index: 0 }).find(CFOptionCheckbox({ disabled: true })).is({ disabled: true, checked: true }),
      CFSettingsRowInteractor({ index: 1 }).find(CFOptionCheckbox({ disabled: true })).is({ disabled: true, checked: true }),
      CFSettingsRowInteractor({ index: 2 }).find(CFOptionCheckbox({ disabled: true })).is({ disabled: true, checked: false })
    ]));
  });

  describe('when custom field is radiobutton set', () => {
    beforeEach(async () => {
      await CFAccordionInteractor({ index: 4 }).clickHeader();
    });

    it('should display available options list', () => Promise.all([
      CFSettingsCellInteractor({ row: 0, column: 'Label' }).has({ content: 'option 1' }),
      CFSettingsCellInteractor({ row: 1, column: 'Label' }).has({ content: 'option 2' }),
    ]));

    it('should disable and check appropriate checkboxes', () => Promise.all([
      CFSettingsRowInteractor({ index: 0 }).find(CFDefaultRadioButton({ disabled: true })).is({ disabled: true, checked: true }),
      CFSettingsRowInteractor({ index: 1 }).find(CFDefaultRadioButton({ disabled: true })).is({ disabled: true, checked: false }),
    ]));
  });

  describe('when custom field is checkbox', () => {
    beforeEach(async () => {
      await CFAccordionInteractor({ index: 6 }).clickHeader();
    });

    it('should display checkbox name', () => CFKeyValueInteractor('Field label').has({ value: 'Checkbox' }));

    it('should show help text section', () => CFKeyValueInteractor('Help text').has({ value: 'checkbox help text' }));
  });
});

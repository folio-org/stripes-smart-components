import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import {
  mount,
  setupApplication,
  axe,
} from '../../../../../tests/helpers';

import ViewCustomFieldsSettings from '../ViewCustomFieldsSettings';
import ViewCustomFieldsSettingsInteractor from './interactor';

describe('ViewCustomFieldsSettings', () => {
  setupApplication();

  const viewCustomFields = new ViewCustomFieldsSettingsInteractor();

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

  let a11yResults = null;

  beforeEach(async () => {
    await renderComponent();
    await viewCustomFields.whenLoaded();
    a11yResults = await axe.run();
  });

  it('should not have any a11y issues', () => {
    expect(a11yResults.violations).to.be.empty;
  });

  describe('when a custom field has help text', () => {
    it('should show help text value', () => {
      expect(viewCustomFields.customFields(0).fields(1).value).to.equal('helpful text');
    });
  });

  describe('when a custom field does not have help text', () => {
    it('should not show help text section', () => {
      const labels = viewCustomFields.customFields(1).fields().map(field => field.label);

      expect(labels).to.not.include('Help text');
    });
  });

  describe('when a custom field is required', () => {
    it('should show "Yes" under "Required" field', () => {
      expect(viewCustomFields.customFields(0).fields(2).value).to.equal('Yes');
    });
  });

  describe('when a custom field is not required', () => {
    it('should show "No" under "Required" field', () => {
      expect(viewCustomFields.customFields(1).fields(1).value).to.equal('No');
    });
  });

  describe('when custom field is single select', () => {
    it('should display available options list', () => {
      const options = viewCustomFields.mcl(0).rows().map(row => {
        return row.cells(0).content;
      });

      expect(options).to.deep.equal(['option 1', 'option 2']);
    });

    it('should check default option', () => {
      expect(viewCustomFields.customFields(2).fields(2).options(0).columns(1).inputChecked).to.be.true;
    });

    it('should disable checkboxes', () => {
      const disabledStates = viewCustomFields
        .customFields(2)
        .fields(2)
        .options()
        .map(option => option.columns(1).inputDisabled);

      expect(disabledStates).to.deep.equal([true, true]);
    });
  });

  describe('when custom field is multi select', () => {
    it('should display available options list', () => {
      const options = viewCustomFields.mcl(1).rows().map(row => {
        return row.cells(0).content;
      });

      expect(options).to.deep.equal(['option 1', 'option 2', 'option 3']);
    });

    it('should check default options', () => {
      const checkedStates = viewCustomFields
        .customFields(3)
        .fields(2)
        .options()
        .map(option => option.columns(1).inputChecked);

      expect(checkedStates).to.deep.equal([true, true, false]);
    });

    it('should disable checkboxes', () => {
      const disabledStates = viewCustomFields.customFields(3).fields(2).options()
        .map(option => option.columns(1).inputDisabled);

      expect(disabledStates).to.deep.equal([true, true, true]);
    });
  });

  describe('when custom field is radiobutton set', () => {
    it('should display available options list', () => {
      const options = viewCustomFields.mcl(2).rows().map(row => {
        return row.cells(0).content;
      });

      expect(options).to.deep.equal(['option 1', 'option 2']);
    });

    it('should check default options', () => {
      expect(viewCustomFields.customFields(4).fields(1).options(0).columns(1).inputChecked).to.be.true;
    });

    it('should disable checkboxes', () => {
      const disabledStates = viewCustomFields.customFields(4).fields(1).options()
        .map(option => option.columns(1).inputDisabled);

      expect(disabledStates).to.deep.equal([true, true]);
    });
  });

  describe('when custom field is checkbox', () => {
    it('should display checkbox name', () => {
      expect(viewCustomFields.customFields(5).fields(0).value).to.equal('Checkbox');
    });
  });
});

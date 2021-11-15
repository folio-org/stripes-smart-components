import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  mount,
  setupApplication,
  axe,
} from '../../../../../tests/helpers';

import EditCustomFieldsSettings from '../EditCustomFieldsSettings';
import EditCustomFieldsSettingsInteractor from './interactor';

describe.skip('EditCustomFieldsSettings', () => {
  setupApplication();

  const editCustomFields = new EditCustomFieldsSettingsInteractor();
  const updateCustomFieldsHandler = sinon.spy();

  const renderComponent = (props = {}) => {
    return mount(
      <EditCustomFieldsSettings
        backendModuleName="users-test"
        entityType="user"
        permissions={{
          canView: true,
          canEdit: true,
          canDelete: true,
        }}
        viewRoute="/custom-fields-view"
        {...props}
      />
    );
  };

  let a11yResults = null;

  beforeEach(async function () {
    this.server.put('/custom-fields', updateCustomFieldsHandler);

    this.server.put('/configurations/entries/tested-custom-field-label', () => ({}));

    await renderComponent();
    await editCustomFields.whenLoaded();
    a11yResults = await axe.run();

    updateCustomFieldsHandler.resetHistory();
  });

  it('should not have any a11y issues', () => {
    expect(a11yResults.violations).to.be.empty;
  });

  it('should show correct section title', () => {
    expect(editCustomFields.sectionTitleValue).to.equal('Custom Fields Test');
  });

  describe('when editing section title', () => {
    beforeEach(async () => {
      await editCustomFields.sectionTitleFillAndBlur('New title');
    });

    it('should enable Save button', () => {
      expect(editCustomFields.saveButtonDisabled).to.be.false;
    });

    it('should enable Cancel button', () => {
      expect(editCustomFields.cancelButtonDisabled).to.be.false;
    });

    describe('and clicking Cancel', () => {
      beforeEach(async () => {
        await editCustomFields.cancel();
      });

      it('should revert changes', () => {
        expect(editCustomFields.sectionTitleValue).to.equal('Custom Fields Test');
      });
    });

    describe('and clicking Save', () => {
      describe('and requests succeed', () => {
        beforeEach(async () => {
          await editCustomFields.save();
        });

        it('should show new title', () => {
          expect(editCustomFields.sectionTitleValue).to.equal('New title');
        });

        it('should redirect to view route', function () {
          expect(this.location.pathname).to.equal('/custom-fields-view');
        });
      });

      describe('and requests fail', () => {
        beforeEach(async function () {
          this.server.put('/custom-fields', {}, 500);

          this.server.put('/configurations/entries/tested-custom-field-label', {}, 500);

          await editCustomFields.save();
        });

        it('should show error message toast', () => {
          // eslint-disable-next-line max-len
          expect(editCustomFields.errorMessage).to.equal('Unable to update due to a module error. Please try again. If problem persists please contact your system administrator.');
        });
      });
    });
  });

  describe('when deleting a custom field', () => {
    describe('and it is not saved', () => {
      beforeEach(async () => {
        await editCustomFields.addFieldButton.selectCustomFieldType(0);
        await editCustomFields.customFields(5).delete();
      });

      it('should not show Delete modal', () => {
        expect(editCustomFields.deleteModal.modalIsPresent).to.be.false;
      });
    });

    describe('and it is saved', () => {
      beforeEach(async () => {
        await editCustomFields.customFields(0).delete();
        await editCustomFields.save();
      });

      it('should show Delete modal', () => {
        expect(editCustomFields.deleteModal.modalIsPresent).to.be.true;
      });

      describe('and when delete is cancelled', () => {
        beforeEach(async () => {
          await editCustomFields.deleteModal.cancelButton.click();
        });

        it('should not remove this custom field', () => {
          expect(editCustomFields.customFields().length).to.equal(5);
        });
      });

      describe('and when delete is confirmed', () => {
        beforeEach(async () => {
          await editCustomFields.deleteModal.confirmButton.click();
        });

        it('should remove this custom field', () => {
          expect(editCustomFields.customFields().length).to.equal(4);
        });
      });
    });
  });

  describe('when creating a custom field with options', () => {
    beforeEach(async () => {
      await editCustomFields.addFieldButton.selectCustomFieldType(1);
      await editCustomFields.customFields(5).fillName('Test field');
      await editCustomFields.customFields(5).options(0).fillOptionName('beta');
      await editCustomFields.customFields(5).options(1).fillOptionName('alpha');
      await editCustomFields.save();
    });

    it('should send correct new custom field data', () => {
      const body = JSON.parse(updateCustomFieldsHandler.args[0][1].requestBody);

      const {
        name,
        selectField,
      } = body.customFields[5];

      expect({ name, selectField }).to.deep.equal({
        name: 'Test field',
        selectField: {
          multiSelect: true,
          options: {
            values: [
              {
                default: false,
                id: 'opt_1',
                value: 'alpha',
              },
              {
                default: false,
                id: 'opt_0',
                value: 'beta',
              },
            ],
          },
        },
      });
    });
  });
});

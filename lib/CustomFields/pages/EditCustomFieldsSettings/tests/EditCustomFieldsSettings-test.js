import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { mount, setupApplication } from '../../../../../tests/helpers';

import EditCustomFieldsSettings from '../EditCustomFieldsSettings';
import EditCustomFieldsSettingsInteractor from './interactor';

describe('EditCustomFieldsSettings', () => {
  setupApplication();

  const editCustomFields = new EditCustomFieldsSettingsInteractor();

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

  beforeEach(async function () {
    this.server.put('/custom-fields', () => {});

    this.server.put('/configurations/entries/tested-custom-field-label', () => ({}));

    await renderComponent();
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
  
        it('should show error message toast', function () {
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
});

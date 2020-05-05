import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { mount, setupApplication } from '../../../../../tests/helpers';

import CustomFieldsForm from '../CustomFieldsForm';
import CustomFieldsFormInteractor from './interactor';


describe.only('AddBuCustomFieldsFormtton', () => {
  setupApplication();

  const customFieldsForm = new CustomFieldsFormInteractor();
  const fetchUsageStatistics = sinon.spy();
  const onCancelDelete = sinon.spy();
  const onConfirmDelete = sinon.spy();
  const onDeleteClick = sinon.spy();
  const onFormReset = sinon.spy();
  const saveCustomFields = sinon.spy();
  const handleSubmit = sinon.spy();

  const renderComponent = (props) => {
    return mount(
      <CustomFieldsForm
        deleteModalIsDisplayed={false}
        entityType="user"
        fetchUsageStatistics={fetchUsageStatistics}
        fieldsToDelete={[]}
        initialValues={{
          customFields: [
            {
              id: 'field_1',
              values: {
                entityType: 'user',
                helpText: '',
                hidden: false,
                name: 'Facebook ID',
                order: 1,
                required: false,
                type: 'TEXTBOX_SHORT',
                visible: true,
              },
            },
          ],
          sectionTitle: 'Custom fields',
        }}
        permissions={{
          canView: true,
          canEdit: true,
          canDelete: true,
        }}
        viewRoute="/settings/users/custom-fields"
        onCancelDelete={onCancelDelete}
        onConfirmDelete={onConfirmDelete}
        onDeleteClick={onDeleteClick}
        onFormReset={onFormReset}
        saveCustomFields={saveCustomFields}
        onSubmit={handleSubmit}
        {...props}
      />
    );
  };

  beforeEach(async () => {
    await renderComponent();

    fetchUsageStatistics.resetHistory();
    onCancelDelete.resetHistory();
    onConfirmDelete.resetHistory();
    onDeleteClick.resetHistory();
    onFormReset.resetHistory();
    saveCustomFields.resetHistory();
    handleSubmit.resetHistory();
  });

  it('should display correct section title', () => {
    expect(customFieldsForm.sectionTitleValue).to.equal('Custom fields');
  });

  describe('when editing section title', () => {
    beforeEach(async () => {
      await customFieldsForm.fillSectionTitle('New custom fields');
    });

    it('should enable Save button', () => {
      expect(customFieldsForm.saveButtonIsDisabled).to.be.false;
    });

    it('should enable Cancel button', () => {
      expect(customFieldsForm.cancelButtonIsDisabled).to.be.false;
    });

    describe('when clicking on Cancel', () => {
      beforeEach(async () => {
        await customFieldsForm.clickCancelButton();
      });

      it('should reset form', () => {
        expect(onFormReset.calledOnce).to.be.true;
      });

      it('should return section title to initial value', () => {
        expect(customFieldsForm.sectionTitleValue).to.equal('Custom fields');
      });
    });

    describe('when clicking on Save', () => {
      beforeEach(async () => {
        await customFieldsForm.clickSaveButton();
      });

      it('should submit form with correct sectionTitle value', () => {
        expect(handleSubmit.calledOnce).to.be.true;
      });

      it('should submit correct sectionTitle value', () => {
        const [formData] = handleSubmit.args[0];

        expect(formData.sectionTitle).to.equal('New custom fields');
      });
    });
  });
});

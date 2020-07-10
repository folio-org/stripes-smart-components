import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { mount, setupApplication } from '../../../../../tests/helpers';

import CustomFieldsForm from '../CustomFieldsForm';
import CustomFieldsFormInteractor from './interactor';
import fetchUsageStatistics from './helpers/fetchUsageStatistics';

describe('CustomFieldsForm', () => {
  setupApplication();

  const customFieldsForm = new CustomFieldsFormInteractor();
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

  it('should display custom field labels in "Add custom field" alphabetically', () => {
    const sortedLabels = ['Checkbox', 'Multi-select', 'Radio button set', 'Single select', 'Text area', 'Text field'];
    const visibleLabels = customFieldsForm.customFieldSelectButtons().map(button => button.label);

    expect(visibleLabels).to.deep.equal(sortedLabels);
  });

  describe('when clicking on an accordion', () => {
    let initialOpenState;

    beforeEach(async () => {
      await customFieldsForm.whenLoaded();
      await customFieldsForm.customFieldAccordions(0).clickHeader();
    });

    it('should change accordion open state', () => {
      expect(customFieldsForm.customFieldAccordions(0).isOpen).to.not.equal(initialOpenState);
    });
  });

  describe('when custom fields accordions are reordered', () => {
    const saveCustomFieldsHandler = sinon.spy();

    beforeEach(async () => {
      saveCustomFieldsHandler.resetHistory();

      await renderComponent({
        saveCustomFields: saveCustomFieldsHandler,
        initialValues: {
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
            {
              id: 'field_2',
              values: {
                entityType: 'user',
                helpText: '',
                hidden: false,
                name: 'Facebook ID 2',
                order: 2,
                required: false,
                type: 'TEXTBOX_SHORT',
                visible: true,
              },
            },
          ],
          sectionTitle: 'Custom fields',
        }
      });

      await customFieldsForm.moveAccordionDown();
    });

    it('should display fields in the correct order', () => {
      expect(customFieldsForm.customFieldAccordions(0).label).to.equal('Facebook ID 2 · Text field');
      expect(customFieldsForm.customFieldAccordions(1).label).to.equal('Facebook ID · Text field');
    });

    it('should save custom fields', () => {
      expect(saveCustomFieldsHandler.called).to.be.true;
    });

    describe('and then some data is filled in before custom fields are reordered', () => {
      beforeEach(async () => {
        saveCustomFieldsHandler.resetHistory();

        await customFieldsForm.fillSectionTitle('New custom fields');
        await customFieldsForm.moveAccordionUp();
      });

      it('should display fields in the correct order', () => {
        expect(customFieldsForm.customFieldAccordions(0).label).to.equal('Facebook ID · Text field');
        expect(customFieldsForm.customFieldAccordions(1).label).to.equal('Facebook ID 2 · Text field');
      });

      it('should not save custom fields', () => {
        expect(saveCustomFieldsHandler.called).to.be.false;
      });
    });
  });

  describe('when editing section title', () => {
    describe('filling in valid data', () => {
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

    describe('filling in too long title', () => {
      beforeEach(async () => {
        await customFieldsForm.fillSectionTitle((new Array(66)).fill('a').join(''));
      });

      it('should not enable Save button', () => {
        expect(customFieldsForm.saveButtonIsDisabled).to.be.true;
      });
    });

    describe('filling in empty title', () => {
      beforeEach(async () => {
        await customFieldsForm.fillSectionTitle('');
      });

      it('should not enable Save button', () => {
        expect(customFieldsForm.saveButtonIsDisabled).to.be.true;
      });
    });
  });

  describe('when clicking "Add custom field" button', () => {
    beforeEach(async () => {
      await customFieldsForm.addButton.click();
    });

    it('should open dropdown', () => {
      expect(customFieldsForm.addButton.dropdown.isOpen).to.equal('true');
    });

    describe('and selecting a custom field type', () => {
      beforeEach(async () => {
        await customFieldsForm.addButton.selectCustomFieldType(0);
      });

      it('should add a new custom field accordion', () => {
        expect(customFieldsForm.customFieldAccordions().length).to.equal(2);
      });
    });

    describe('and selecting a custom field with type TEXTFIELD', () => {
      beforeEach(async () => {
        await customFieldsForm.addButton.selectCustomFieldType(0);
      });

      it('should show correct field type in accordion label', () => {
        expect(customFieldsForm.customFieldAccordions(1).label).to.include('Checkbox');
      });
    });
  });

  describe('when deleting a custom field', () => {
    beforeEach(async () => {
      await renderComponent({
        fieldsToDelete: [
          {
            index: 0,
            data: {
              id: '0',
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
          },
        ],
        initialValues: {
          customFields: [],
          sectionTitle: 'Some title',
        },
        deleteModalIsDisplayed: true,
      });

      await customFieldsForm.deleteModal.whenLoaded();
    });

    it('should display Delete modal', () => {
      expect(customFieldsForm.deleteModal.modalIsPresent);
    });
  });
});

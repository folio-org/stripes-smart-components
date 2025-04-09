import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  Button,
  Dropdown,
  runAxeTest,
  TextField,
  including
} from '@folio/stripes-testing';

import {
  setupApplication,
} from '../../../../../tests/helpers';

import CustomFieldsForm from '../CustomFieldsForm';
import fetchUsageStatistics from './helpers/fetchUsageStatistics';

import {
  CustomFieldsFormInteractor,
  CFAccordionInteractor,
  CFAddMenuInteractor,
  CFDeleteModalInteractor
} from '../../../tests/interactors';

describe('CustomFieldsForm', () => {
  const onCancelDelete = sinon.spy();
  const onConfirmDelete = sinon.spy();
  const onDeleteClick = sinon.spy();
  const onFormReset = sinon.spy();
  const saveCustomFields = sinon.spy();
  const handleSubmit = sinon.spy();

  const form = CustomFieldsFormInteractor();
  const titleField = form.find(TextField(including('Accordion title')));
  const saveButton = form.find(Button(including('Save')));
  const cancelButton = form.find(Button(including('Cancel')));
  const addMenu = CFAddMenuInteractor();

  const renderComponent = (props) => {
    setupApplication({
      component: <CustomFieldsForm
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
        onOptionDelete={() => () => {}}
        optionsStatsLoaded
        optionsToDelete={{}}
        fieldOptionsStats={{}}
        {...props}
      />
    });
  };

  renderComponent();

  beforeEach(async () => {
    onCancelDelete.resetHistory();
    onConfirmDelete.resetHistory();
    onDeleteClick.resetHistory();
    onFormReset.resetHistory();
    saveCustomFields.resetHistory();
    handleSubmit.resetHistory();
    await Dropdown(including('Add')).open();
  });

  // skipping until accessibility issues are resolved :(
  describe('when component is rendered', () => {
    it.skip('should not have any a11y issues', () => runAxeTest());
  });

  it('should display correct section title', () => titleField.has({ value: 'Custom fields' }));

  it('should display custom field labels in "Add custom field" alphabetically', () => {
    const sortedLabels = [
      'Checkbox',
      'Date picker',
      'Multi-select',
      'Radio button set',
      'Single select',
      'Text area',
      'Text field',
    ];
    return addMenu.has({ itemLabels: sortedLabels });
  });

  describe('when clicking on an accordion', () => {
    beforeEach(async () => {
      await CFAccordionInteractor({ index: 0 }).clickHeader();
    });

    it('should change accordion open state', () => CFAccordionInteractor({ index: 0 }).has({ open: true }));
  });

  describe('when custom fields accordions are reordered', () => {
    const saveCustomFieldsHandler = sinon.spy();

    renderComponent({
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

    beforeEach(async () => {
      saveCustomFieldsHandler.resetHistory();

      await CFAccordionInteractor({ label: 'Facebook ID · Text field', index: 0 }).moveDown();
    });

    it('should display fields in the correct order', () => CFAccordionInteractor('Facebook ID · Text field').has({ index: 1 }));

    it('should save custom fields', () => {
      expect(saveCustomFieldsHandler.called).to.be.true;
    });

    describe('and then some data is filled in before custom fields are reordered', () => {
      beforeEach(async () => {
        saveCustomFieldsHandler.resetHistory();

        await titleField.fillIn('New custom fields');
        await CFAccordionInteractor({ label: 'Facebook ID · Text field', index: 1 }).moveUp();
      });

      it('should display fields in the correct order', () => CFAccordionInteractor('Facebook ID · Text field').has({ index: 0 }));

      it('should not save custom fields', () => {
        expect(saveCustomFieldsHandler.called).to.be.false;
      });
    });
  });

  describe('when editing section title', () => {
    describe('filling in valid data', () => {
      beforeEach(async () => {
        await titleField.fillIn('New custom fields');
      });

      describe('when clicking on Cancel', () => {
        beforeEach(async () => {
          await cancelButton.click();
        });

        it('should reset form', () => {
          expect(onFormReset.calledOnce).to.be.true;
        });

        it('should return section title to initial value', () => titleField.has({ value: 'Custom fields' }));
      });

      describe('when clicking on Save', () => {
        beforeEach(async () => {
          await saveButton.click();
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
        await titleField.fillIn((new Array(66)).fill('a').join(''));
      });

      it('should not enable Save button', () => saveButton.is({ disabled: true }));
    });

    describe('filling in empty title', () => {
      beforeEach(async () => {
        await titleField.fillIn('');
      });

      it('should not enable Save button', () => saveButton.is({ disabled: true }));
    });
  });

  describe('when clicking "Add custom field" button', () => {
    describe('and selecting a custom field type', () => {
      beforeEach(async () => {
        await form.addField('Checkbox');
      });

      it('should add a new custom field accordion', () => form.has({ count: 2 }));

      it('should show correct field type in accordion label', () => CFAccordionInteractor(including('Checkbox')).has({ index: 1 }));
    });
  });

  describe('when deleting a custom field', () => {
    renderComponent({
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

    it('should display Delete modal', () => CFDeleteModalInteractor().exists());
  });
});

import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { Form, Field } from 'react-final-form';

import {
  runAxeTest,
  converge,
  HTML,
  TextField,
  TextArea,
  including,
  Accordion,
} from '@folio/stripes-testing';

import {
  setupApplication,
  mount,
} from '../../../../../tests/helpers';

import EditCustomFieldsRecord from '../EditCustomFieldsRecord';
import {
  CustomFieldsRecordForm
} from '../../../tests/interactors';

describe('EditCustomFieldsRecord', () => {
  setupApplication();

  const changeFinalFormField = sinon.spy();
  const changeReduxFormField = sinon.spy();
  const onComponentLoad = sinon.spy();
  const onToggle = sinon.spy();
  let mockFinalFormInstance;

  const renderComponent = (props = {}) => {
    mockFinalFormInstance = {
      getState: sinon.stub().returns({ 
        values: { 
          customFields: {},
          existingField: 'existing-value'
        } 
      }),
      restart: sinon.spy(),
    };

    const FormComponent = () => (
      <Form onSubmit={() => {}}>
        {({ form: { getState } }) => (
          <EditCustomFieldsRecord
            accordionId="test-accordion-id"
            backendModuleName="users-test"
            changeFinalFormField={changeFinalFormField}
            finalFormCustomFieldsValues={getState().values.customFields}
            finalFormInstance={mockFinalFormInstance}
            entityType="user"
            expanded
            formName="custom-fields-test"
            isReduxForm={false}
            onComponentLoad={onComponentLoad}
            onToggle={onToggle}
            fieldComponent={Field}
            {...props}
          />
        )}
      </Form>
    );

    return mount(
      <FormComponent />
    );
  };

  beforeEach(async () => {
    changeFinalFormField.resetHistory();
    changeReduxFormField.resetHistory();
    onToggle.resetHistory();
    onComponentLoad.resetHistory();
  });

  describe('when there are no custom fields', () => {
    beforeEach(async function () {
      this.server.get('/custom-fields', {
        'customFields': [],
      });

      await renderComponent();
    });

    it('should not have any a11y issues', () => runAxeTest());

    it('should not show custom fields accordion', () => CustomFieldsRecordForm().absent());
  });

  describe('when custom fields are loaded', () => {
    beforeEach(async function () {
      await renderComponent();
    });

    it('should not have any a11y issues', () => runAxeTest());

    it('should label and set id of accordion', () => CustomFieldsRecordForm('Custom Fields Test').has({ id: 'test-accordion-id' }));

    it('should show all visible custom fields', () => CustomFieldsRecordForm('Custom Fields Test').has({ fieldCount: 7 }));

    it('should call onComponentLoad', () => {
      return converge(() => {
        expect(onComponentLoad.called).to.be.true;
      });
    });

    describe('when Single Select field has a default option', () => {
      it('should update form with this value', () => {
        const expected = [
          'customFields.single_select-1',
          'opt_0'
        ];
        return converge(() => { if (!changeFinalFormField.calledWith(expected[0], expected[1])) throw new Error(`expected form change to be called with ${expected[0]} ${expected[1]}`); });
      });
    });

    describe('when Multi Select field has default options', () => {
      it('should update form with this value', () => {
        const expected = [
          'customFields.multi_select-2',
          ['opt_0', 'opt_1']
        ];
        return converge(() => { if (!changeFinalFormField.calledWith(expected[0], expected[1])) throw new Error(`expected form change to be called with ${expected[0]} ${expected[1]}`); });
      });
    });

    describe('when there is no custom field label', () => {
      beforeEach(function () {
        this.server.get('/configurations/entries', () => ({
          configs: [],
        }));
      });

      it('should show default accordion label', () => CustomFieldsRecordForm('Custom fields').exists());
    });
  });

  describe('when there is a `scope` prop', () => {
    beforeEach(async () => {
      await renderComponent({
        scope: 'test-scope',
      });
    });

    it('should retrieve the accordion label from the /settings/entries API', () => {
      return HTML('Custom Fields label').exists();
    });
  });

  describe('when the `sectionId` is "feesFines"', () => {
    beforeEach(async () => {
      await renderComponent({
        scope: 'test-scope',
        sectionId: 'feesFines',
      });
    });

    it('should not show custom fields accordion', () => CustomFieldsRecordForm().absent());

    it('should display only fields with sectionId "feesFines"', () => TextField({ label: including('Textbox 1') }).exists());

    it('should not display fields with other sectionIds', () => TextArea({ label: including('Textarea 1') }).absent());
  });

  describe('when the sectionId is "default"', () => {
    beforeEach(async () => {
      await renderComponent({
        scope: 'test-scope',
        sectionId: 'default',
      });
    });

    it('should display an accordion', () => Accordion().exists());

    it('should display only fields with `displayInAccordion` missing or equal to "default"', () => {
      return CustomFieldsRecordForm('Custom Fields label').has({ fieldCount: 6 });
    });
  });

  describe('Create mode vs Edit mode behavior', () => {
    describe('when isCreateMode is true', () => {
      beforeEach(async function () {
        await renderComponent({
          isCreateMode: true,
        });
      });

      it('should use finalFormInstance.restart to set initial values without marking form dirty', () => {
        return converge(() => {
          expect(mockFinalFormInstance.restart.called).to.be.true;
        });
      });

      it('should merge existing form values with new default values when restarting', () => {
        return converge(() => {
          const newInitialValues = mockFinalFormInstance.restart.getCall(0).args[0];
          
          expect(newInitialValues.existingField).to.equal('existing-value');
          expect(newInitialValues.customFields).to.be.an('object');
        });
      });
    });

    describe('when isCreateMode is false (edit mode)', () => {
      beforeEach(async function () {
        await renderComponent({
          isCreateMode: false,
        });
      });

      it('should use changeFinalFormField instead of restart for edit scenarios', () => {
        return converge(() => {
          expect(mockFinalFormInstance.restart.called).to.be.false;
          expect(changeFinalFormField.called).to.be.true;
        });
      });
    });

    describe('when finalFormInstance is not available', () => {
      beforeEach(async function () {
        await renderComponent({
          isCreateMode: true,
          finalFormInstance: null,
        });
      });

      it('should fallback to changeFinalFormField even in create mode', () => {
        return converge(() => {
          expect(changeFinalFormField.called).to.be.true;
        });
      });
    });
  });

  describe('when no default values are present', () => {
    beforeEach(async function () {
      this.server.get('/custom-fields', {
        customFields: [
          {
            id: '3',
            name: 'Single select',
            refId: 'single_select-1',
            type: 'SINGLE_SELECT_DROPDOWN',
            entityType: 'user',
            visible: true,
            required: false,
            order: 3,
            helpText: '',
            selectField: {
              multiSelect: false,
              options: {
                values: [{
                  id: 'opt_0',
                  value: 'option 1',
                  default: false,
                }, {
                  id: 'opt_1',
                  value: 'option 2',
                  default: false,
                }],
              }
            }
          },
        ],
      });

      await renderComponent();
    });

    it('should not initialize fields', () => {
      return converge(() => {
        expect(mockFinalFormInstance.restart.called).to.be.false;
        expect(changeFinalFormField.called).to.be.false;
      });
    });
  });
});

import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { Form, Field } from 'react-final-form';

import { mount, setupApplication } from '../../../../../tests/helpers';

import EditCustomFieldsRecord from '../EditCustomFieldsRecord';
import EditCustomFieldsRecordInteractor from './interactor';

describe('EditCustomFieldsRecord', () => {
  setupApplication();

  const editCustomFields = new EditCustomFieldsRecordInteractor();

  const changeFinalFormField = sinon.spy();
  const changeReduxFormField = sinon.spy();
  const onToggle = sinon.spy();

  const renderComponent = (props = {}) => {
    const FormComponent = () => (
      <Form onSubmit={() => {}}>
        {({ form: { getState }}) => (
          <EditCustomFieldsRecord
            accordionId='test-accordion-id'
            backendModuleName='users-test'
            changeFinalFormField={changeFinalFormField}
            finalFormCustomFieldsValues={getState().values.customFields}
            entityType='user'
            expanded
            formName='custom-fields-test'
            isReduxForm={false}
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

  beforeEach(async function () {
    this.server.get('/configurations/entries', (schema, request) => {
      if (request.url.includes('custom_fields_label')) {
        return {
          configs: [{
            id: 'tested-custom-field-label',
            module: 'USERS',
            configName: 'custom_fields_label',
            enabled: true,
            value: 'Custom Fields Test',
          }],
        };
      }
  
      return { configs: [] };
    });

    this.server.get('/custom-fields', {
      'customFields': [{
        'id': '1',
        'name': 'Textbox 1',
        'refId': 'textbox-1',
        'type': 'TEXTBOX_SHORT',
        'entityType': 'user',
        'visible': true,
        'required': true,
        'order': 1,
        'helpText': 'helpful text',
      }, {
        'id': '2',
        'name': 'Textarea 1',
        'refId': 'textarea-1',
        'type': 'TEXTBOX_LONG',
        'entityType': 'user',
        'visible': true,
        'required': false,
        'order': 2,
        'helpText': '',
      }, {
        'id' : '3',
        'name' : 'Single select',
        'refId' : 'single_select-1',
        'type' : 'SINGLE_SELECT_DROPDOWN',
        'entityType' : 'user',
        'visible' : true,
        'required' : false,
        'order' : 3,
        'helpText' : '',
        'selectField' : {
          'defaults' : [ 'option 1' ],
          'multiSelect' : false,
          'options' : {
            'values' : [ 'option 1', 'option 2' ],
            'sorted' : [ ]
          }
        }
      }, {
        'id' : '4',
        'name' : 'Multi select',
        'refId' : 'multi_select-2',
        'type' : 'MULTI_SELECT_DROPDOWN',
        'entityType' : 'user',
        'visible' : true,
        'required' : false,
        'order' : 4,
        'helpText' : '',
        'selectField' : {
          'defaults' : [ 'option 1', 'option 2' ],
          'multiSelect' : true,
          'options' : {
            'values' : [ 'option 1', 'option 2', 'option 3' ],
            'sorted' : [ ]
          }
        }
      }, {
        'id' : '5',
        'name' : 'Radio',
        'refId' : 'radio_1',
        'type' : 'RADIO_BUTTON',
        'entityType' : 'user',
        'visible' : true,
        'required' : false,
        'order' : 5,
        'helpText' : '',
        'selectField' : {
          'defaults' : [ 'option 1' ],
          'multiSelect' : false,
          'options' : {
            'values' : [ 'option 1', 'option 2' ],
            'sorted' : [ ]
          }
        }
      }],
    });

    await renderComponent();

    changeFinalFormField.resetHistory();
    changeReduxFormField.resetHistory();
    onToggle.resetHistory();
  });

  describe('when custom fields are not loaded', () => {
    beforeEach(async function () {
      this.server.get('/custom-fields', {
        'customFields': [],
      });

      await renderComponent();
    });

    it('should not show custom fields accordion', () => {
      expect(editCustomFields.accordionIsPresent).to.be.false;
    });
  });

  describe('when custom fields are loaded', () => {
    it('should show custom fields accordion', () => {
      expect(editCustomFields.accordionIsPresent).to.be.true;
    });

    it('should show correct accordion label', () => {
      expect(editCustomFields.accordion.label).to.equal('Custom Fields Test');
    });

    it('should show all visible custom fields', () => {
      expect(editCustomFields.customFields().length).to.equal(5);
    });

    describe('when Single Select field has a default option', () => {
      it('should update form with this value', () => {
        expect(changeFinalFormField.calledWith('customFields.single_select-1', 'option 1')).to.be.true;
      });
    });

    describe('when Multi Select field has default options', () => {
      it('should update form with this value', () => {
        expect(changeFinalFormField.calledWith('customFields.multi_select-2', ['option 1', 'option 2'])).to.be.true;
      });
    });
  });
});

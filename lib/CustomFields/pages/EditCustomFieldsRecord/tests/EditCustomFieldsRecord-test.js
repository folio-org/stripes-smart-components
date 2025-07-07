import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { Form, Field } from 'react-final-form';

import {
  runAxeTest,
  converge,
  HTML,
  MultiSelect,
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

  const renderComponent = (props = {}) => {
    const FormComponent = () => (
      <Form onSubmit={() => {}}>
        {({ form: { getState } }) => (
          <EditCustomFieldsRecord
            accordionId="test-accordion-id"
            backendModuleName="users-test"
            changeFinalFormField={changeFinalFormField}
            finalFormCustomFieldsValues={getState().values.customFields}
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

    await renderComponent();
  });

  describe('when there are no custom fields', () => {
    beforeEach(async function () {
      this.server.get('/custom-fields', {
        'customFields': [],
      });
    });

    it('should not have any a11y issues', () => runAxeTest());

    it('should not show custom fields accordion', () => CustomFieldsRecordForm().absent());
  });

  describe('when custom fields are loaded', () => {
    it('should not have any a11y issues', () => runAxeTest());

    it('should label and set id of accordion', () => CustomFieldsRecordForm('Custom Fields Test').has({ id: 'test-accordion-id' }));

    it('should show all visible custom fields', () => CustomFieldsRecordForm('Custom Fields Test').has({ fieldCount: 7 }));

    it('should call onComponentLoad', () => {
      expect(onComponentLoad.called).to.be.true;
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

    describe('MultiSelection validation behavior', () => {
      beforeEach(async function () {
        // Mock custom fields with two multiselect fields - one required, one not
        this.server.get('/custom-fields', {
          'customFields': [
            {
              'id': '1',
              'name': 'Required Multi Select',
              'refId': 'required_multi_select-1',
              'type': 'MULTI_SELECT_DROPDOWN',
              'entityType': 'user',
              'visible': true,
              'required': true,
              'order': 1,
              'helpText': '',
              'selectField': {
                'multiSelect': true,
                'options': {
                  'values': [{
                    'id': 'req_opt_0',
                    'value': 'Required Option 1',
                    'default': false,
                  }, {
                    'id': 'req_opt_1',
                    'value': 'Required Option 2',
                    'default': false,
                  }],
                }
              }
            },
            {
              'id': '2',
              'name': 'Optional Multi Select',
              'refId': 'optional_multi_select-2',
              'type': 'MULTI_SELECT_DROPDOWN',
              'entityType': 'user',
              'visible': true,
              'required': false,
              'order': 2,
              'helpText': '',
              'selectField': {
                'multiSelect': true,
                'options': {
                  'values': [{
                    'id': 'opt_opt_0',
                    'value': 'Optional Option 1',
                    'default': false,
                  }, {
                    'id': 'opt_opt_1',
                    'value': 'Optional Option 2',
                    'default': false,
                  }],
                }
              }
            }
          ],
        });

        await renderComponent();
      });

      it('should not show validation error for required field when removing option from optional field', async () => {
        await MultiSelect('Required Multi Select*').select('Required Option 1');
        await MultiSelect('Optional Multi Select').select('Optional Option 1');
        await MultiSelect('Optional Multi Select').find(IconButton({ icon: 'times' })).click();
        await new Promise(setTimeout);

        return MultiSelect('Required Multi Select*').find(HTML(including('is required'))).absent();
      });

      it('should show validation error when required field is actually empty', async () => {
        await MultiSelect('Required Multi Select*').focus();
        await MultiSelect('Optional Multi Select').focus();
        
        return MultiSelect('Required Multi Select*').find(HTML(including('is required'))).exists();
      });
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
});

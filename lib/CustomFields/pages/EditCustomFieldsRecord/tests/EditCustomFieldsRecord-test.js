import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { Form, Field } from 'react-final-form';

import {
  runAxeTest,
  converge,
} from '@folio/stripes-testing';

import {
  setupApplication,
} from '../../../../../tests/helpers';

import EditCustomFieldsRecord from '../EditCustomFieldsRecord';
import {
  CustomFieldsRecordForm
} from '../../../tests/interactors';

describe('EditCustomFieldsRecord', () => {
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

    setupApplication({
      component: <FormComponent />
    });
  };

  renderComponent();

  beforeEach(async () => {
    changeFinalFormField.resetHistory();
    changeReduxFormField.resetHistory();
    onToggle.resetHistory();
  });

  describe('when there are no custom fields', () => {
    renderComponent();

    beforeEach(async function () {
      this.server.get('/custom-fields', {
        'customFields': [],
      });
    });

    it('should not have any a11y issues', () => runAxeTest());

    it('should not show custom fields accordion', () => CustomFieldsRecordForm().absent());
  });

  describe('when custom fields are loaded', () => {
    beforeEach(async () => {
      await renderComponent();
    });

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
  });
});

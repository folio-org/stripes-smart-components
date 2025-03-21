import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { Form, Field } from 'react-final-form';

import {
  runAxeTest,
  Accordion,
  HTML,
} from '@folio/stripes-testing';

import {
  setupApplication,
} from '../../../../../tests/helpers';

import EditCustomFieldsRecord from '../EditCustomFieldsRecord';
import EditCustomFieldsRecordInteractor from './interactor';

const CustomFieldEditInteractor = HTML.extend('custom field edit field')
  .selector('[data-test-record-edit-custom-field]')
  .locator(el => el.querySelector('label').textContent)
  .filters({
    count: () => document.querySelectorAll('[data-test-record-edit-custom-field]').length,
  });

describe('EditCustomFieldsRecord', () => {
  const editCustomFields = new EditCustomFieldsRecordInteractor();

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

      await editCustomFields.whenCustomFieldsLoaded();
    });

    it('should not have any a11y issues', () => runAxeTest());

    it('should not show custom fields accordion', () => HTML({ id: 'test-accordion-id' }).exists());
  });

  describe('when custom fields are loaded', () => {
    beforeEach(async () => {
      await renderComponent();
    });

    it('should not have any a11y issues', () => runAxeTest());

    it('should show custom fields accordion', () => HTML({ id: 'test-accordion-id' }).exists());

    it('should show correct accordion label', () => Accordion({ label: 'Custom Fields Test' }).exists());

    it('should show all visible custom fields', () => CustomFieldEditInteractor('Textbox 1*').has({ count: 7 }));

    it('should call onComponentLoad', () => {
      expect(onComponentLoad.called).to.be.true;
    });

    describe('when Single Select field has a default option', () => {
      it('should update form with this value', () => {
        expect(changeFinalFormField.calledWith('customFields.single_select-1', 'opt_0')).to.be.true;
      });
    });

    describe('when Multi Select field has default options', () => {
      it('should update form with this value', () => {
        expect(changeFinalFormField.calledWith('customFields.multi_select-2', ['opt_0', 'opt_1'])).to.be.true;
      });
    });

    describe('when there is no custom field label', () => {
      beforeEach(function () {
        this.server.get('/configurations/entries', () => ({
          configs: [],
        }));
      });

      it('should show default accordion label', () => Accordion({ label: 'Custom fields' }).exists());
    });
  });
});

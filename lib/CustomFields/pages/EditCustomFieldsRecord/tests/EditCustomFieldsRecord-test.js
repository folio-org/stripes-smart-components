import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { Form, Field } from 'react-final-form';

import {
  setupApplication,
  axe,
} from '../../../../../tests/helpers';

import EditCustomFieldsRecord from '../EditCustomFieldsRecord';
import EditCustomFieldsRecordInteractor from './interactor';

describe('EditCustomFieldsRecord', () => {
  const editCustomFields = new EditCustomFieldsRecordInteractor();

  const changeFinalFormField = sinon.spy();
  const changeReduxFormField = sinon.spy();
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

  let a11yResults = null;

  describe('when there are no custom fields', () => {
    renderComponent();

    beforeEach(async function () {
      this.server.get('/custom-fields', {
        'customFields': [],
      });

      await editCustomFields.whenCustomFieldsLoaded();
      a11yResults = await axe.run();
    });

    it('should not have any a11y issues', () => {
      expect(a11yResults.violations).to.be.empty;
    });

    it('should not show custom fields accordion', () => {
      expect(editCustomFields.accordionIsPresent).to.be.false;
    });
  });

  describe('when custom fields are loaded', () => {
    renderComponent();

    beforeEach(async () => {
      await editCustomFields.whenCustomFieldsLoaded();
      a11yResults = await axe.run();
    });

    it('should not have any a11y issues', () => {
      expect(a11yResults.violations).to.be.empty;
    });

    it('should show custom fields accordion', () => {
      expect(editCustomFields.accordionIsPresent).to.be.true;
    });

    it('should show correct accordion label', () => {
      expect(editCustomFields.accordion.label).to.equal('Custom Fields Test');
    });

    it('should show all visible custom fields', () => {
      expect(editCustomFields.customFields().length).to.equal(7);
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

      it('should show default accordion label', () => {
        expect(editCustomFields.accordion.label).to.equal('Custom fields');
      });
    });
  });
});

import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  mount,
  setupApplication,
  axe,
} from '../../../../../tests/helpers';

import ViewCustomFieldsRecord from '../ViewCustomFieldsRecord';
import ViewCustomFieldsRecordInteractor from './interactor';

describe('ViewCustomFieldsRecord', () => {
  setupApplication();

  const viewCustomFields = new ViewCustomFieldsRecordInteractor();

  const onToggle = sinon.spy();

  const renderComponent = (props = {}) => {
    return mount(
      <ViewCustomFieldsRecord
        accordionId="some-accordion-id"
        backendModuleName="users-test"
        customFieldsValues={{
          'textbox-1': 'Some text value',
          'single_select-1': 'opt_0',
          'multi_select-2': ['opt_1', 'opt_2'],
          'radio_1': 'opt_1',
        }}
        entityType="user"
        expanded
        onToggle={onToggle}
        {...props}
      />
    );
  };

  axe.configure({
    rules: [{
      id: 'heading-order',
      enabled: false,
    }],
  });

  let a11yResults = null;

  beforeEach(async () => {
    await renderComponent();
    await viewCustomFields.whenLoaded();
    a11yResults = await axe.run();

    onToggle.resetHistory();
  });

  it('should not have any a11y issues', () => {
    expect(a11yResults.violations).to.be.empty;
  });

  it('should display corrent number of fields', () => {
    expect(viewCustomFields.fields().length).to.equal(5);
  });

  it('should display value for fields with a value', () => {
    expect(viewCustomFields.fields(0).value).to.equal('Some text value');
  });

  it('should display dash for fields without a value', () => {
    expect(viewCustomFields.fields(1).value).to.equal('-');
  });

  it('should show multiple value for multiselect with several values', () => {
    expect(viewCustomFields.fields(3).value).to.equal('option 2, option 3');
  });

  describe('when clicking on accordion', () => {
    beforeEach(async () => {
      await viewCustomFields.accordion.clickHeader();
      await viewCustomFields.whenFieldsAreVisible();
      a11yResults = await axe.run();
    });

    it('should not have any a11y issues', () => {
      expect(a11yResults.violations).to.be.empty;
    });

    it('should call onToggle', () => {
      expect(onToggle.calledOnce).to.be.true;
    });
  });
});

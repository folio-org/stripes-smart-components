import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { mount, setupApplication } from '../../../../../tests/helpers';

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
          'single_select-1': 'option 2',
          'multi_select-2': ['option 2', 'option 3'],
          'radio_1': 'option 1',
        }}
        entityType="user"
        expanded
        onToggle={onToggle}
        {...props}
      />
    );
  };

  beforeEach(async () => {
    await renderComponent();

    onToggle.resetHistory();
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
    });

    it('should call onToggle', () => {
      expect(onToggle.calledOnce).to.be.true;
    });
  });
});

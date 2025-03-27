import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  runAxeTest,
  KeyValue,
  Accordion
} from '@folio/stripes-testing';

import {
  mount,
  setupApplication,
} from '../../../../../tests/helpers';

import ViewCustomFieldsRecord from '../ViewCustomFieldsRecord';
// import ViewCustomFieldsRecordInteractor from './interactor';

const ViewCustomFieldsRecordInteractor = Accordion.extend('view custom field accordion')
  .filters({
    fieldCount: el => [...el.querySelectorAll('[class^=kvRoot--]')].length
  });

const CustomFieldKeyValue = KeyValue.extend('custom field keyvalue')
  .filters({
    index: el => {
      const region = el.closest('[class^=content-region-]');
      const keyvalues = [...region.querySelectorAll('[class^=kvRoot--]')];

      return keyvalues.findIndex(k => k === el);
    }
  });

describe('ViewCustomFieldsRecord', () => {
  setupApplication();

  const viewCustomFields = ViewCustomFieldsRecordInteractor();

  const onToggle = sinon.spy();

  const renderComponent = (props = {}) => {
    // note the default scenario has five fields, one for each type,
    // but only four values are present here, so the TEXTBOX_LONG
    // field (textarea-1) will be rendered on the view-page via NoValue.
    return mount(
      <ViewCustomFieldsRecord
        accordionId="some-accordion-id"
        backendModuleName="users-test"
        customFieldsValues={{
          'textbox-1': 'Some text value',
          'single_select-1': 'opt_0',
          'multi_select-2': ['opt_1', 'opt_2'],
          'radio_1': 'opt_1',
          'date1': '2023-04-01'
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

  it('should not have any a11y issues', () => runAxeTest());

  it('should display current number of fields', () => viewCustomFields.has({ fieldCount: 7 }));

  it('should display value for fields with a value', () => CustomFieldKeyValue({ index: 0 }).has({ value: 'Some text value' }));

  it('should display formated date value for DATE_PICKER type', () => CustomFieldKeyValue({ index: 5 }).has({ value: '4/1/2023' }));

  it('should display dash for fields without a value', () => CustomFieldKeyValue({ index: 1 }).has({ value: 'No value set-' }));

  it('should show multiple value for multiselect with several values', () => CustomFieldKeyValue({ index: 3 }).has({ value: 'option 2, option 3' }));

  describe('when clicking on accordion', () => {
    beforeEach(async () => {
      await ViewCustomFieldsRecordInteractor().clickHeader();
    });

    it('should call onToggle', () => {
      expect(onToggle.calledOnce).to.be.true;
    });
  });
});

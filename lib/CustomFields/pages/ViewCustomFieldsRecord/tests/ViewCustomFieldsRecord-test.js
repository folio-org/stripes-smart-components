import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  HTML,
  runAxeTest,
  Accordion,
  including,
  Callout,
} from '@folio/stripes-testing';

import {
  mount,
  setupApplication,
} from '../../../../../tests/helpers';

import ViewCustomFieldsRecord from '../ViewCustomFieldsRecord';

import {
  CFKeyValueInteractor as CFKeyValue,
  CustomFieldRecordViewInteractor
} from '../../../tests/interactors';

describe('ViewCustomFieldsRecord', () => {
  setupApplication();

  const viewCustomFields = CustomFieldRecordViewInteractor();

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

  it('should display value for fields with a value', () => CFKeyValue({ index: 0 }).has({ value: 'Some text value' }));

  it('should display formated date value for DATE_PICKER type', () => CFKeyValue({ index: 5 }).has({ value: '4/1/2023' }));

  it('should display dash for fields without a value', () => CFKeyValue({ index: 1 }).has({ value: 'No value set-' }));

  it('should show multiple value for multiselect with several values', () => CFKeyValue({ index: 3 }).has({ value: 'option 2, option 3' }));

  describe('when clicking on accordion', () => {
    beforeEach(async () => {
      await viewCustomFields.clickHeader();
    });

    it('should call onToggle', () => {
      expect(onToggle.calledOnce).to.be.true;
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

    it('should display only fields with sectionId "feesFines"', () => CFKeyValue('Textbox 1').exists());

    it('should not display fields with other sectionIds', () => CFKeyValue('Textarea 1').absent());
  });

  describe('when the sectionId is "default"', () => {
    beforeEach(async () => {
      await renderComponent({
        scope: 'test-scope',
        sectionId: 'default',
      });
    });

    it('should display an accordion', () => Accordion().exists());

    it('should display only fields with `displayInAccordion` missing or equal to "default"', () => viewCustomFields.has({ fieldCount: 6 }));
  });

  describe('when the section title fetch fails', () => {
    beforeEach(async function() {
      this.server.get('/settings/entries', () => {
        throw new Error('403 Forbidden');
      });

      await renderComponent({
        scope: 'test-scope',
        sectionId: 'default',
      });
    });

    it('should display a toast error', () => {
      return Callout().exists();
    });

    it('should display the default accordion title', () => {
      return Accordion('Custom fields').exists();
    });
  });
});

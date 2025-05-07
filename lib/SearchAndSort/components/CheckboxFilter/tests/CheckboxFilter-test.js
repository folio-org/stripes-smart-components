import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  HTML,
  Checkbox
} from '@folio/stripes-testing';

import { setupApplication } from '../../../../../tests/helpers';

import CheckboxFilter from '../CheckboxFilter';

const FilterCheckbox = Checkbox.extend('filter checkbox')
  .filters({
    index: el => {
      const cbs = [...el.parentNode.querySelectorAll('[data-test-checkbox]')];
      return cbs.findIndex(cb => cb === el);
    }
  });

const CheckboxFilterInteractor = HTML.extend('checkbox filter')
  .selector('[data-test-checkbox-filter]')
  .filters({
    count: el => [...el.querySelectorAll('[data-test-checkbox]')].length
  })
  .actions({
    clickIndex: ({ find }, index) => find(FilterCheckbox({ index })).click()
  });

const onChangeHandler = sinon.spy();

const CheckboxFilterHarness = (props) => {
  return (
    <div data-test-checkbox-filter="true">
      <CheckboxFilter
        name="language"
        onChange={onChangeHandler}
        dataOptions={[
          { value: 'en', label: 'English' },
          { value: 'fr', label: 'French' },
          { value: 'ge', label: 'German' },
          { value: 'it', label: 'Italian' },
        ]}
        {...props}
      />
    </div>
  );
};

describe('CheckboxFilter', () => {
  const checkboxFilter = CheckboxFilterInteractor();

  beforeEach(async () => {
    onChangeHandler.resetHistory();
  });

  describe('rendering', () => {
    setupApplication({
      component: (
        <CheckboxFilterHarness />
      )
    });

    it('should render all filter data options', () => checkboxFilter.has({ count: 4 }));
  });

  describe('after click on readonly data option', () => {
    setupApplication({
      component: (
        <CheckboxFilterHarness
          dataOptions={[
            {
              value: 'en',
              label: 'English',
              readOnly: true,
            },
          ]}
        />
      )
    });

    beforeEach(async () => {
      await checkboxFilter.clickIndex(0);
    });

    it('should not call onChange callback', () => {
      expect(onChangeHandler.called).to.equal(false);
    });
  });

  describe('after click on disabled data option', () => {
    setupApplication({
      component: (
        <CheckboxFilterHarness
          dataOptions={[
            {
              value: 'en',
              label: 'English',
              disabled: true,
            },
          ]}
        />
      )
    });

    it('should disable the checkbox', () => FilterCheckbox().has({ index: 0, disabled: true }));
  });

  describe('when there are selected data options', () => {
    setupApplication({
      component: (
        <CheckboxFilterHarness
          selectedValues={['fr', 'ge']}
        />
      )
    });

    it('should render selected data options', () => Promise.all([
      FilterCheckbox({ index: 1 }).is({ checked: true }),
      FilterCheckbox({ index: 2 }).is({ checked: true }),
    ]));

    describe('after click on unselected data option', () => {
      beforeEach(async () => {
        await checkboxFilter.clickIndex(0);
      });

      it('should raise filter name and new selected values to onChange callback', () => {
        expect(onChangeHandler.args[0]).to.deep.equal([{
          name: 'language',
          values: ['fr', 'ge', 'en'],
        }]);
      });
    });

    describe('after click on selected option', () => {
      beforeEach(async () => {
        await checkboxFilter.clickIndex(1);
      });

      it('should raise filter name with the remaining selected values to onChange callback', () => {
        expect(onChangeHandler.args[0]).to.deep.equal([{
          name: 'language',
          values: ['ge'],
        }]);
      });
    });
  });
});

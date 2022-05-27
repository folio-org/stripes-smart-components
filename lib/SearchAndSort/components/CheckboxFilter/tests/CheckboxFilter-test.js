import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { setupApplication, mount } from '../../../../../tests/helpers';
// import { mountWithContext } from '@folio/stripes-components/tests/helpers';

import CheckboxFilter from '../CheckboxFilter';
import CheckboxFilterInteractor from './interactor';

const onChangeHandler = sinon.spy();

const CheckboxFilterHarness = (props) => {
  return (
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
  );
};

describe('CheckboxFilter', () => {
  const checkboxFilter = new CheckboxFilterInteractor();

  beforeEach(async () => {
    onChangeHandler.resetHistory();
  });

  describe('rendering', () => {
    setupApplication({
      component: (
        <CheckboxFilterHarness />
      )
    });

    it('should render all filter data options', () => {
      expect(checkboxFilter.dataOptionsCount).to.equal(4);
    });
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
      await checkboxFilter.dataOptions(0).click();
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

    beforeEach(async () => {
      await checkboxFilter.dataOptions(0).click();
    });

    it('should not call onChange callback', () => {
      expect(onChangeHandler.called).to.equal(false);
    });
  });

  describe('when there are selected data options', () => {
    setupApplication({
      component: (
        <CheckboxFilterHarness
          selectedValues={['fr', 'ge']}
        />
      )
    });

    it('should render selected data options', () => {
      expect(checkboxFilter.dataOptions(1).isSelected).to.equal(true);
      expect(checkboxFilter.dataOptions(2).isSelected).to.equal(true);
    });

    describe('after click on unselected data option', () => {
      beforeEach(async () => {
        await checkboxFilter.dataOptions(0).click();
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
        await checkboxFilter.dataOptions(1).click();
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

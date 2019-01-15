import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { mountWithContext } from '@folio/stripes-components/tests/helpers';

import CheckboxFilter from '../CheckboxFilter';
import CheckboxFilterInteractor from './interactor';


describe('CheckboxFilter', () => {
  const checkboxFilter = new CheckboxFilterInteractor();
  const onChangeHandler = sinon.spy();

  const renderComponent = (props) => {
    return mountWithContext(
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

  beforeEach(async () => {
    await renderComponent();

    onChangeHandler.resetHistory();
  });

  it('should render all filter data options', () => {
    expect(checkboxFilter.dataOptionsCount).to.equal(4);
  });


  describe('after click on readonly data option', () => {
    beforeEach(async () => {
      await renderComponent({
        dataOptions: [
          {
            value: 'en',
            label: 'English',
            readOnly: true,
          },
        ]
      });
      await checkboxFilter.dataOptions(0).click();
    });

    it('should not call onChange callback', () => {
      expect(onChangeHandler.called).to.equal(false);
    });
  });

  describe('after click on disabled data option', () => {
    beforeEach(async () => {
      await renderComponent({
        dataOptions: [
          {
            value: 'en',
            label: 'English',
            disabled: true,
          },
        ]
      });
      await checkboxFilter.dataOptions(0).click();
    });

    it('should not call onChange callback', () => {
      expect(onChangeHandler.called).to.equal(false);
    });
  });

  describe('when there are selected data options', () => {
    beforeEach(async () => {
      await renderComponent({
        selectedValues: ['fr', 'ge'],
      });
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

import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import MultiSelectInteractor from '@folio/stripes-components/lib/MultiSelection/tests/interactor';

import { setupApplication } from '../../../../../tests/helpers';

import MultiSelectionFilter from '../MultiSelectionFilter';

const multiSelectionFilter = new MultiSelectInteractor();

const dataOptions = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ge', label: 'German' },
  { value: 'it', label: 'Italian' },
];

const onChangeHandler = sinon.spy();

const MultiSelectionFilterHarness = (props) => (
  <MultiSelectionFilter
    name="language"
    dataOptions={dataOptions}
    onChange={onChangeHandler}
    {...props}
  />
);

describe('MultiSelectionFilter', () => {
  beforeEach(async () => {
    onChangeHandler.resetHistory();
  });

  describe('rendering', () => {
    setupApplication({
      component: <MultiSelectionFilterHarness />
    });

    it('should not render any selected values by default', () => {
      expect(multiSelectionFilter.values()).to.deep.equal([]);
    });
  });

  describe('when there are selected values', () => {
    setupApplication({
      component: (
        <MultiSelectionFilterHarness
          selectedValues={['en', 'fr', 'ge']}
        />
      )
    });

    it('should display selected values', () => {
      expect(multiSelectionFilter.values(0).text).to.equal('English');
      expect(multiSelectionFilter.values(1).text).to.equal('French');
      expect(multiSelectionFilter.values(2).text).to.equal('German');
    });

    describe('after click on a value delete button', () => {
      beforeEach(async () => {
        await multiSelectionFilter.values(0).clickRemoveButton();
      });

      it('should call onChange callback with filter name and rest values', () => {
        expect(onChangeHandler.args[0]).to.deep.equal([{
          name: 'language',
          values: ['fr', 'ge'],
        }]);
      });
    });

    describe('after click on selected option', () => {
      beforeEach(async () => {
        await multiSelectionFilter.options(1).clickOption();
      });

      it('should call onChange callback with filter name and rest values', () => {
        expect(onChangeHandler.args[0]).to.deep.equal([{
          name: 'language',
          values: ['en', 'ge']
        }]);
      });
    });

    describe('after click on unselected option', () => {
      beforeEach(async () => {
        await multiSelectionFilter.options(3).clickOption();
      });

      it('should pass filter name and all selected values to onChange callback', () => {
        expect(onChangeHandler.args[0]).to.deep.equal([{
          name: 'language',
          values: ['en', 'fr', 'ge', 'it'],
        }]);
      });
    });
  });
});

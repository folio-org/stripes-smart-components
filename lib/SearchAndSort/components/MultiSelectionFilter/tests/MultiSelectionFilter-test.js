import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  MultiSelect,
  ValueChipRoot,
  IconButton,
  converge
} from '@folio/stripes-testing';
import isEqual from 'lodash/isEqual';

import { setupApplication } from '../../../../../tests/helpers';

import MultiSelectionFilter from '../MultiSelectionFilter';

const MultiSelectInteractor = MultiSelect.extend('multiselect filter')
  .actions({
    deselect: ({ find }, value) => find(ValueChipRoot(value)).find(IconButton('times')).click()
  });

const multiSelectionFilter = MultiSelectInteractor();

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

    it('should not render any selected values by default', () => multiSelectionFilter.has({ selected: [] }));
  });

  describe('when there are selected values', () => {
    setupApplication({
      component: (
        <MultiSelectionFilterHarness
          selectedValues={['en', 'fr', 'ge']}
        />
      )
    });

    it('should display selected values', () => Promise.all([
      ValueChipRoot('English').exists(),
      ValueChipRoot('French').exists(),
      ValueChipRoot('German').exists(),
    ]));

    describe('after click on a value delete button', () => {
      beforeEach(async () => {
        await multiSelectionFilter.deselect('English');
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
        await multiSelectionFilter.choose('French');
      });

      it('should call onChange callback with filter name and rest values', async () => {
        const expected = [{
          name: 'language',
          values: ['en', 'ge']
        }];
        await converge(() => {
          if (!isEqual(expected, onChangeHandler.args[0])) throw new Error(`expected onChange value to equal expected.${JSON.stringify(expected)}`);
        });
      });
    });

    describe('after click on unselected option', () => {
      beforeEach(async () => {
        await multiSelectionFilter.choose('Italian');
      });

      it('should pass filter name and all selected values to onChange callback', async () => {
        const expected = [{
          name: 'language',
          values: ['en', 'fr', 'ge', 'it'],
        }];
        await converge(() => {
          if (!isEqual(expected, onChangeHandler.args[0])) throw new Error(`expected onChange value to equal expected.${JSON.stringify(expected)}`);
        });
      });
    });
  });
});

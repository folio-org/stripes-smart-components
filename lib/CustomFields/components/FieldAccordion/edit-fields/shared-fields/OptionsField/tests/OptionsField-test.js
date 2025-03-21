import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import stripesFinalForm from '@folio/stripes-final-form';

import {
  Button,
  HTML,
  runAxeTest,
  TextField,
  Checkbox,
  MultiColumnListRow,
  RadioButton,
  including
} from '@folio/stripes-testing';

import {
  mount,
  setupApplication,
  axe,
} from '../../../../../../../../tests/helpers';

import OptionsField from '../OptionsField';
import OptionsFieldInteractor from './interactor';

const OptionsMessage = HTML.extend('option fields message')
  .selector('[class^=optionsLeftMessage]');

const MaxOptionsMessage = HTML.extend('max options message')
  .selector('[class^=maxOptionsNumberReached]');


describe('OptionsField', () => {
  setupApplication();

  const changeFieldValue = sinon.spy();
  const onSubmit = sinon.spy();

  const renderComponent = (fieldProps = {}, formProps = {}) => {
    const Form = () => (
      <form>
        <OptionsField
          changeFieldValue={changeFieldValue}
          fieldNamePrefix="customFields[0].values"
          isMultiSelect={false}
          maxOptionsNumber={4}
          {...fieldProps}
        />
      </form>
    );

    const OptionsFieldForm = stripesFinalForm({})(Form);

    return mount(
      <OptionsFieldForm
        onSubmit={onSubmit}
        initialValues={{
          customFields: [
            {
              id: 'field_1',
              values: {
                entityType: 'user',
                helpText: '',
                hidden: false,
                name: 'Major',
                order: 1,
                required: false,
                type: 'SINGLE_SELECT_DROPDOWN',
                selectField: {
                  multiSelect: false,
                  options: {
                    values: [{
                      id: 'opt_0',
                      value: 'Economics',
                      default: false,
                    }, {
                      id: 'opt_1',
                      value: 'History',
                      default: false,
                    }],
                  }
                },
                visible: true,
              },
            },
          ],
          sectionTitle: 'Custom fields',
        }}
        {...formProps}
      />
    );
  };

  beforeEach(async () => {
    await renderComponent();
    // await optionsField.whenLoaded();
    // a11yResults = await axe.run();
    changeFieldValue.resetHistory();
    onSubmit.resetHistory();
  });

  it('should not have any a11y issues', () => runAxeTest());

  describe('when field type is single select', () => {
    it('should show first radio checked if there is no default option',
      () => MultiColumnListRow({ index: 0 }).find(RadioButton()).has({ checked: true }));
  });

  describe('when creating options', () => {
    beforeEach(async () => {
      await Button('Add option').click();
    });

    it('should not have any a11y issues', () => runAxeTest());

    describe('and max number of options is not reached', () => {
      it('should show correct number of options left', () => OptionsMessage().has({ text: 'You can add 1 more option.' }));
    });

    describe('and reaching a max number of options', () => {
      beforeEach(async () => {
        await Button('Add option').click();
      });

      it('should hide Add option button', () => Button('Add option').absent());

      it('should show info message', () => MaxOptionsMessage().has({ text: 'You have added the maximum number of options.' }));
    });

    describe('and filling in invalid data', () => {
      describe('empty label', () => {
        beforeEach(async () => {
          await MultiColumnListRow({ index: 2 }).find(TextField()).fillIn('');
        });

        it('should not have any a11y issues', () => runAxeTest());

        it('should show error message', () => MultiColumnListRow({ index: 2 }).find(TextField()).has({ error: 'Option label is required.' }));
      });

      describe('too long label', () => {
        beforeEach(async () => {
          await MultiColumnListRow({ index: 2 }).find(TextField()).fillIn(new Array(101).fill('a').join(''));
        });

        it('should show error message', () => MultiColumnListRow({ index: 2 }).find(TextField()).has({ error: '100 has been exceeded.' }));
      });

      describe('duplicated label', () => {
        beforeEach(async () => {
          await MultiColumnListRow({ index: 3 }).find(TextField()).fillIn('History');
        });

        it('should show error message', () => MultiColumnListRow({ index: 3 }).find(TextField()).has({ error: 'Duplicate option. Please revise.' }));
      });
    });
  });

  describe('when selecting option as default', () => {
    beforeEach(async () => {
      await MultiColumnListRow({ index: 2 }).find(RadioButton()).click();
    });

    it('should not have any a11y issues', () => runAxeTest());

    it('should set option as default', () => {
      expect(changeFieldValue.calledOnceWith([
        {
          id: 'opt_0',
          value: 'Economics',
          default: false,
        }, {
          id: 'opt_1',
          value: 'History',
          default: true,
        }
      ]));
    });
  });
});

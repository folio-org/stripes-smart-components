import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import stripesFinalForm from '@folio/stripes-final-form';

import { mount, setupApplication } from '../../../../../../../../tests/helpers';

import OptionsField from '../OptionsField';
import OptionsFieldInteractor from './interactor';

describe('OptionsField', () => {
  setupApplication();

  const optionsField = new OptionsFieldInteractor();
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
    changeFieldValue.resetHistory();
    onSubmit.resetHistory();
  });

  describe('when field type is single select', () => {
    it('should show first radio checked if there is no default option', () => {
      expect(optionsField.rows(0).defaultRadioChecked).to.be.true;
    });
  });

  describe('when creating options', () => {
    beforeEach(async () => {
      await optionsField.addOption();
    });

    describe('and max number of options is not reached', () => {
      it('should show correct number of options left', () => {
        expect(optionsField.optionsLeftMessage).to.equal('You can add 1 more option.');
      });
    });

    describe('and reaching a max number of options', () => {
      beforeEach(async () => {
        await optionsField.addOption();
      });

      it('should hide Add option button', () => {
        expect(optionsField.addOptionButtonIsPresent).to.be.false;
      });

      it('should show info message', () => {
        expect(optionsField.maxOptionsNumberReachedMessage).to.equal('You have added the maximum number of options.');
      });
    });

    describe('and filling in invalid data', () => {
      describe('empty label', () => {
        beforeEach(async () => {
          await optionsField.rows(3).labelFillAndBlur('');
        });

        it('should show error message', () => {
          expect(optionsField.rows(3).errorMessage).to.equal('Option label is required.');
        });
      });

      describe('loo long label', () => {
        beforeEach(async () => {
          await optionsField.rows(3).labelFillAndBlur(new Array(101).fill('a').join(''));
        });

        it('should show error message', () => {
          expect(optionsField.rows(3).errorMessage).to.equal('100 has been exceeded.');
        });
      });

      describe('duplicated label', () => {
        beforeEach(async () => {
          await optionsField.rows(3).labelFillAndBlur('History');
        });

        it('should show error message', () => {
          expect(optionsField.rows(3).errorMessage).to.equal('Duplicate option. Please revise.');
        });
      });
    });
  });

  describe('when selecting option as default', () => {
    beforeEach(async () => {
      await optionsField.rows(2).checkDefaultRadio();
    });

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

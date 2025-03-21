import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import stripesFinalForm from '@folio/stripes-final-form';

import {
  runAxeTest
} from '@folio/stripes-testing';

import {
  mount,
  setupApplication,
  axe,
} from '../../../../../../../../tests/helpers';

import HelpTextField from '../HelpTextField';
import HelpTextFieldInteractor from './interactor';

describe('HelpTextField', () => {
  setupApplication();

  const helpTextField = new HelpTextFieldInteractor();

  const renderComponent = (fieldProps = {}, formProps = {}) => {
    const Form = () => (
      <form>
        <HelpTextField
          fieldNamePrefix="customFields[0].values"
          {...fieldProps}
        />
      </form>
    );

    const HelpTextForm = stripesFinalForm({})(Form);

    return mount(
      <HelpTextForm
        onSubmit={() => {}}
        initialValues={{
          customFields: [
            {
              id: 'field_1',
              values: {
                entityType: 'user',
                helpText: '',
                hidden: false,
                name: 'Facebook ID',
                order: 1,
                required: false,
                type: 'TEXTBOX_SHORT',
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

  let a11yResults = null;

  beforeEach(async () => {
    await renderComponent();
    await helpTextField.whenLoaded();
    a11yResults = await axe.run();
  });

  it('should not have any a11y issues', () => {
    expect(a11yResults.violations).to.be.empty;
  });

  describe('when editing field', () => {
    describe('and filling in invalid data', () => {
      beforeEach(async () => {
        await helpTextField.fillAndBlur(new Array(101).fill('a').join(''));
      });

      it('should show error message', () => {
        expect(helpTextField.inputFill.has({ error: '100 character limit has been exceeded. Please revise.' }));
      });
    });

    describe('and filling in valid data', () => {
      beforeEach(async () => {
        await helpTextField.fillAndBlur('some valid text');
      });

      it('should not show error message', () => {
        expect(helpTextField.inputFill.has({ error: '' }));
      });
    });
  });
});

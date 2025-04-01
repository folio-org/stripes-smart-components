import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import stripesFinalForm from '@folio/stripes-final-form';

import {
  runAxeTest,
  TextField
} from '@folio/stripes-testing';

import {
  mount,
  setupApplication,
} from '../../../../../../../../tests/helpers';

import HelpTextField from '../HelpTextField';

describe('HelpTextField', () => {
  setupApplication();

  const helpTextField = TextField('Help text');

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

  beforeEach(async () => {
    await renderComponent();
  });

  it('should not have any a11y issues', () => runAxeTest());

  describe('when editing field', () => {
    describe('and filling in invalid data', () => {
      beforeEach(async () => {
        await helpTextField.fillIn(new Array(101).fill('a').join(''));
      });

      it('should show error message', () => helpTextField.has({ error: '100 character limit has been exceeded. Please revise.' }));
    });

    describe('and filling in valid data', () => {
      beforeEach(async () => {
        await helpTextField.fillIn('some valid text');
      });

      it('should not show error message', () => (helpTextField.has({ error: undefined })));
    });
  });
});

import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { Response } from 'miragejs';
import {
  TextField as PasswordValidationFieldInteractor,
  converge
} from '@folio/stripes-testing';


import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';
import TestForm, { TestFinalForm } from '../../../tests/TestForm';

import PasswordValidationField from '../PasswordValidationField';

const ConnectedField = connectStripes(PasswordValidationField);

describe('PasswordValidationField', () => {
  const passwordField = PasswordValidationFieldInteractor();

  setupApplication();
  let rulesLoaded = false;
  beforeEach(async function () {
    rulesLoaded = false;
    // return rules for testing password validations
    this.server.get('/tenant/rules', (schema, request) => {
      rulesLoaded = true;

      // stripes-connect requires `X-Request-URL` header for `response.url`
      return new Response(200, { 'X-Request-URL': request.url }, {
        rules: [
          {
            ruleId: '5105b55a-b9a3-4f76-9402-a5243ea63c95',
            name: 'password_length',
            type: 'RegExp',
            validationType: 'Strong',
            state: 'Enabled',
            moduleName: 'mod-password-validator',
            expression: '^.{8,}$',
            description: 'The password length must be at least 8 characters long',
            orderNo: 0,
            errMessageId: 'password.length.invalid'
          }
        ],
        totalRecords: 1
      });
    });
  });

  describe('using redux-form', () => {
    beforeEach(async () => {
      // mount the component under test
      await mount(
        <TestForm>
          <ConnectedField
            id="password-test"
            name="password"
            label="Test"
            username="test"
          />
        </TestForm>
      );

      // wait for validation to load
      await converge(() => { if (!rulesLoaded) throw new Error('rules not loaded'); });
    });

    describe('with an invalid password', () => {
      beforeEach(async () => {
        await passwordField.focus();
        await passwordField.fillIn('test');
        await passwordField.blur();
      });

      // THIS test has an unknown intermittent failure in CI
      it.skip('shows a validation error for invalid length', () => passwordField.has({ error: 'The password length must be minimum 8 symbols.' }));
    });
  });

  describe('using final form', () => {
    beforeEach(async () => {
      await mount(
        <TestFinalForm>
          { () => (
            <ConnectedField
              token="token"
              id="password-test"
              name="password"
              label="Test"
              username="test"
              fieldClass="final-form"
            />)
          }
        </TestFinalForm>
      );

      // wait for validation to load
      await converge(() => { if (!rulesLoaded) throw new Error('rules not loaded'); });
    });

    describe('with valid password and final form', () => {
      beforeEach(async () => {
        await passwordField.fillIn('test-string');
        await passwordField.blur();
      });

      it('doesn\'t show a validation error', () => passwordField.has({ valid: true }));
    });

    describe('with invalid password and final form', () => {
      beforeEach(async () => {
        await passwordField.fillIn('1');
        await passwordField.blur();
      });

      // THIS test has an unknown intermittent failure (even locally, in isolation). 1/8 runs will fail.
      // viewing locally, the UI will fill in the single character, and display no validation message.
      // if the value is manually entered manually, it appears with the onChange (as expected.)
      // suspecting Final Form is the culprit, but not sure.
      it.skip('shows a validation error', () => passwordField.has({ error: 'The password length must be minimum 8 symbols.' }));
    });
  });
});

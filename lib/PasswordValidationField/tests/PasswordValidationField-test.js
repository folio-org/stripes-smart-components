import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { when } from '@bigtest/convergence';
import { Response } from 'miragejs';
import { expect } from 'chai';

import PasswordValidationFieldInteractor from './interactor';

import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';
import TestForm from '../../../tests/TestForm';

import PasswordValidationField from '../PasswordValidationField';

const ConnectedField = connectStripes(PasswordValidationField);

describe('PasswordValidationField', () => {
  const passwordField = new PasswordValidationFieldInteractor();
  const field = passwordField.TextField;


  setupApplication();

  beforeEach(async function () {
    let rulesLoaded = false;

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

    // mount the component under test
    mount(
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
    await when(() => rulesLoaded);
  });

  it('is a textfield component', () => {
    expect(field.isPresent).to.be.true;
  });

  describe('with an invalid password', () => {
    beforeEach(async () => {
      await field.focusInput();
      await field.fillInput('test');
      await field.blurInput();
    });

    it('shows a validation error for invalid length', () => {
      expect(field.inputError).to.be.true;
      expect(passwordField.inputErrorType).to.equal('password.length.invalid');
    });
  });

  describe('with valid password and final form', () => {
    beforeEach(async () => {
      mount(
        <TestForm>
          <ConnectedField
            id="password-test"
            name="password"
            label="Test"
            username="test"
            fieldClass="final-form"
          />
        </TestForm>
      );
      await field.focusInput();
      await field.fillInput('test-string');
      await field.blurInput();
    });

    it('doesnt show a validation error', () => {
      expect(field.inputError).to.be.false;
    });
  });

  describe('with invalid password and final form', () => {
    beforeEach(async () => {
      mount(
        <TestForm>
          <ConnectedField
            id="password-test"
            name="password"
            label="Test"
            username="test"
            fieldClass="final-form"
          />
        </TestForm>
      );
      await field.focusInput();
      await field.fillInput('1');
      await field.blurInput();
    });

    it('shows a validation error', () => {
      expect(field.inputError).to.be.true;
    });
  });
});

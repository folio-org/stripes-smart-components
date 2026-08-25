import {
  composeValidators,
  defaultValidationHandler,
  getErrors,
} from './PasswordValidationField';

describe('PasswordValidationField helpers', () => {
  describe('defaultValidationHandler', () => {
    it('returns no validation result when there are no errors', () => {
      expect(defaultValidationHandler([])).toBeUndefined();
    });

    it('returns a message for the last validation error', () => {
      const result = defaultValidationHandler([
        'password.length.invalid',
        'password.username.invalid',
      ]);

      expect(result.props['data-test-invalid-password']).toBe('password.username.invalid');
      expect(result.props.children.props.id).toBe('stripes-smart-components.password.username.invalid');
    });
  });

  describe('getErrors', () => {
    const rules = [
      {
        expression: '^.{8,}$',
        errMessageId: 'password.length.invalid',
      },
      {
        expression: '[A-Z]',
        errMessageId: 'password.uppercase.invalid',
      },
      {
        name: 'no_user_name',
        expression: '^(?!.*<USER_NAME>).*$',
        errMessageId: 'password.username.invalid',
      },
      {
        expression: '',
        errMessageId: 'password.rule-without-expression.invalid',
      },
    ];

    it('returns an empty array when the password satisfies every rule', () => {
      expect(getErrors(rules, 'Secure-password', 'diku_admin')).toEqual([]);
    });

    it('returns the error ids for failed rules in rule order', () => {
      expect(getErrors(rules, 'user', 'user')).toEqual([
        'password.length.invalid',
        'password.uppercase.invalid',
        'password.username.invalid',
      ]);
    });

    it('replaces the username placeholder only for the username rule', () => {
      const usernameRule = {
        name: 'no_user_name',
        expression: '^(?!.*<USER_NAME>).*$',
        errMessageId: 'password.username.invalid',
      };

      expect(getErrors([usernameRule], 'diku_admin-password', 'diku_admin'))
        .toEqual(['password.username.invalid']);
      expect(getErrors([usernameRule], 'secure-password', 'diku_admin')).toEqual([]);
    });
  });

  describe('composeValidators', () => {
    it('returns the first validation error and stops evaluating validators', () => {
      const firstValidator = jest.fn(() => 'first error');
      const secondValidator = jest.fn(() => 'second error');
      const validate = composeValidators(firstValidator, secondValidator);

      expect(validate('password')).toBe('first error');
      expect(firstValidator).toHaveBeenCalledWith('password');
      expect(secondValidator).not.toHaveBeenCalled();
    });

    it('returns undefined when all validators pass', () => {
      const firstValidator = jest.fn();
      const secondValidator = jest.fn();
      const validate = composeValidators(firstValidator, secondValidator);

      expect(validate('password')).toBeUndefined();
      expect(firstValidator).toHaveBeenCalledWith('password');
      expect(secondValidator).toHaveBeenCalledWith('password');
    });
  });
});

import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field as ReduxFormField } from 'redux-form';
import { Field as FinalFormField } from 'react-final-form';
import isEmpty from 'lodash/isEmpty';

import { TextField } from '@folio/stripes-components';

import { usePasswordValidationRules } from './usePasswordValidationRules';

const NO_USERNAME_RULE_NAME = 'no_user_name';
const USERNAME_PLACEHOLDER = '<USER_NAME>';

export const defaultValidationHandler = (errors) => {
  if (!isEmpty(errors)) {
    return (
      <span data-test-invalid-password={errors[errors.length - 1]}>
        <FormattedMessage id={`stripes-smart-components.${errors[errors.length - 1]}`} />
      </span>
    );
  }

  return null;
};

/**
 * getErrors
 * Test value against the rules, returning an empty array if the value is
 * acceptable, or an array of errors if not.
 *
 * @param {Array} rules list of password validation rules
 * @param {string} value potential password to be validated
 * @param {string} username username, since a password may not contain it
 * @returns Array of violations on failure; empty array on success
 */
export const getErrors = (rules, value, username) => {
  return rules.filter(({ expression }) => expression)
    .reduce((errors, rule) => {
      const {
        errMessageId,
        expression,
        name,
      } = rule;

      // sub the **actual username into the NO_USERNAME_RULE_NAME rule.
      // other rules get used as-is, of course.
      const parsedExpression = (name === NO_USERNAME_RULE_NAME)
        ? expression.replace(USERNAME_PLACEHOLDER, username)
        : expression;

      const regex = new RegExp(parsedExpression);

      if (!regex.test(value)) {
        errors.push(errMessageId);
      }

      return errors;
    }, []);
};

export const composeValidators = (...validators) => value => validators
  .reduce((error, validator) => error || validator(value), undefined);

const PasswordValidationField = ({
  fieldClass = 'redux-form',
  username,
  validate = [],
  validationHandler = defaultValidationHandler,
  ...props
}) => {
  const rules = usePasswordValidationRules();

  const validatePassword = (value) => {
    if (rules?.length) {
      return validationHandler(getErrors(rules, value, username));
    }
  };

  return (
    <>
      {fieldClass === 'redux-form' && (
        <ReduxFormField
          type="password"
          component={TextField}
          validate={[...validate, validatePassword]}
          {...props}
        />
      )}
      {fieldClass === 'final-form' && (
        <FinalFormField
          {...props}
          type="password"
          component={TextField}
          validate={composeValidators(...validate, validatePassword)}
        />
      )}
    </>
  );
};

PasswordValidationField.propTypes = {
  fieldClass: PropTypes.oneOf(['redux-form', 'final-form']),
  username: PropTypes.string.isRequired,
  validate: PropTypes.arrayOf(PropTypes.func),
  validationHandler: PropTypes.func,
};

export default PasswordValidationField;

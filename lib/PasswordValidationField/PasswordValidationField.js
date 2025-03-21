/* eslint-disable consistent-return */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field as ReduxFormField } from 'redux-form';
import { Field as FinalFormField } from 'react-final-form';
import isEmpty from 'lodash/isEmpty';

import { TextField, omitProps } from '@folio/stripes-components';

const defaultValidationHandler = (errors) => {
  if (!isEmpty(errors)) {
    return (
      <span data-test-invalid-password={errors[errors.length - 1]}>
        <FormattedMessage id={`stripes-smart-components.${errors.pop()}`} />
      </span>
    );
  }
};

class PasswordValidationField extends React.Component {
  static manifest = Object.freeze({
    validators: {
      type: 'okapi',
      path: 'tenant/rules',
      throwErrors: false,
      fetch: false,
      accumulate: true,
    },
  });

  static propTypes = {
    fieldClass: PropTypes.oneOf(['redux-form', 'final-form']),
    mutator: PropTypes.shape({
      validators: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    token: PropTypes.string,
    username: PropTypes.string.isRequired,
    validate: PropTypes.arrayOf(PropTypes.func),
    validationHandler: PropTypes.func,
  };

  static defaultProps = {
    validate: [],
    validationHandler: defaultValidationHandler,
    token: '',
    fieldClass: 'redux-form',
  };

  constructor(props) {
    super(props);

    this.noUserNameRuleName = 'no_user_name';
    this.userNamePlaceholder = '<USER_NAME>';
  }

  async componentDidMount() {
    this.rules = await this.getRules();
  }

  async getRules() {
    const {
      mutator,
      token,
    } = this.props;
    const headers = token
      ? { headers: { 'x-okapi-token': token } }
      : {};
    const { rules } = await mutator.validators.GET(headers);

    return rules;
  }

  validatePassword = value => {
    if (!this.rules) {
      return;
    }

    const {
      username,
      validationHandler,
    } = this.props;

    return validationHandler(this.getErrors(value, username));
  };

  getErrors(value, username) {
    return this.rules.filter(({ expression }) => expression)
      .reduce((errors, rule) => {
        const {
          errMessageId,
          expression,
          name,
        } = rule;

        const parsedExpression = (name === this.noUserNameRuleName)
          ? expression.replace(this.userNamePlaceholder, username)
          : expression;

        const regex = new RegExp(parsedExpression);

        if (!regex.test(value)) {
          errors.push(errMessageId);
        }

        return errors;
      }, []);
  }

  render() {
    const {
      validate,
      fieldClass,
      // should not be passed further
      // eslint-disable-next-line no-unused-vars
      validationHandler,
      ...props
    } = this.props;
    const fieldProps = omitProps(props, ['dataKey', 'refreshRemote']);
    const composeValidators = (...validators) => value => validators
      .reduce((error, validator) => error || validator(value), undefined);

    return (
      <>
        {fieldClass === 'redux-form' && (
          <ReduxFormField
            type="password"
            component={TextField}
            validate={[...validate, this.validatePassword]}
            {...fieldProps}
          />
        )}
        {fieldClass === 'final-form' && (
          <FinalFormField
            {...fieldProps}
            type="password"
            component={TextField}
            validate={composeValidators(...validate, this.validatePassword)}
          />
        )}
      </>
    );
  }
}

export default PasswordValidationField;

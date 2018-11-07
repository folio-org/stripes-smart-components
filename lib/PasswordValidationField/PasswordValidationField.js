/* eslint-disable consistent-return */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { TextField } from '@folio/stripes-components';
import omitProps from '@folio/stripes-components/util/omitProps';

const defaultHandleValidation = (valid, errorCode) => {
  return (
    !valid && <FormattedMessage id={`stripes-smart-components.${errorCode}`} />
  );
};

class PasswordValidationField extends React.Component {
  static manifest = Object.freeze({
    validators: {
      type: 'okapi',
      path: 'tenant/rules?query=(type=RegExp and state=Enabled)',
      throwErrors: false,
      fetch: false,
      accumulate: true
    },
  });

  static propTypes = {
    handleValidation: PropTypes.func,
    mutator: PropTypes.shape({
      validators: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    token: PropTypes.string,
    username: PropTypes.string.isRequired,
    validate: PropTypes.arrayOf(PropTypes.func),
  };

  static defaultProps = {
    validate: [],
    handleValidation: defaultHandleValidation,
    token: '',
  };

  async componentDidMount() {
    this.rules = await this.getRules();
  }

  async getRules() {
    const {
      mutator,
      token,
    } = this.props;
    const headers = token
      ? {
        headers: {
          'x-okapi-token': token
        }
      }
      : {};
    const { rules } = await mutator.validators.GET(headers);

    return rules;
  }

  validatePassword = value => {
    const { username } = this.props;
    const noUserNameRuleName = 'no_user_name';

    if (!this.rules) {
      return;
    }

    this.rules.filter(({ expression }) => expression)
      .map(rule => {
        if (rule.name === noUserNameRuleName) {
          const userNamePlaceholder = '<USER_NAME>';

          return {
            ...rule,
            expression: rule.expression.replace(userNamePlaceholder, username),
          };
        }

        return rule;
      });

    return this.applyRules(this.rules, value);
  };

  applyRules(rules, value) {
    const { handleValidation } = this.props;

    for (const { expression, errMessageId } of rules) {
      const regex = new RegExp(expression);
      const validationMessage = handleValidation(regex.test(value), errMessageId);

      if (validationMessage) {
        return validationMessage;
      }
    }
  }

  render() {
    const {
      validate,
      // should not be passed further
      // eslint-disable-next-line no-unused-vars
      handleValidation,
      ...props
    } = this.props;
    const fieldProps = omitProps(props, ['dataKey', 'refreshRemote']);

    return (
      <Field
        type="password"
        component={TextField}
        validate={[...validate, this.validatePassword]}
        {...fieldProps}
      />
    );
  }
}

export default PasswordValidationField;

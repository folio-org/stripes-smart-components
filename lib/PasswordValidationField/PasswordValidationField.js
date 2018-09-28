import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { TextField } from '@folio/stripes-components';
import omitProps from '@folio/stripes-components/util/omitProps';

class PasswordValidationField extends React.Component {
  static manifest = Object.freeze({
    validators: {
      type: 'okapi',
      path: 'tenant/rules?query=(type=RegExp and state=Enabled)',
      throwErrors: false,
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      validators: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
      }),
    }).isRequired,
    username: PropTypes.string.isRequired,
    validate: PropTypes.arrayOf(PropTypes.func),
  };

  static defaultProps = {
    validate: [],
  };

  validatePassword = value => {
    const { username, resources } = this.props;
    const noUserNameRuleName = 'no_user_name';

    if (!resources.validators.hasLoaded) {
      return undefined;
    }

    const rules = (resources.validators.records[0].rules)
      .filter(({ expression }) => expression)
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

    for (const { expression, errMessageId } of rules) {
      const regex = new RegExp(expression);

      if (!regex.test(value)) {
        return (
          <FormattedMessage id={`stripes-smart-components.${errMessageId}`} />
        );
      }
    }

    return undefined;
  };

  render() {
    const { validate, ...props } = this.props;
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

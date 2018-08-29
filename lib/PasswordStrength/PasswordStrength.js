import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import taiPasswordStrength from 'tai-password-strength';

class PasswordStrength extends React.Component {
  static propTypes = {
    password: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.strengthTester = new taiPasswordStrength.PasswordStrength();
    this.strengthTester.addCommonPasswords(taiPasswordStrength.commonPasswords);
    this.strengthTester.addTrigraphMap(taiPasswordStrength.trigraphs);
    this.output = 'weak'; // set default password hint to weak
  }

  componentDidUpdate(prevProps) {
    // in case password updated and provided
    if (this.props.password && this.props.password !== prevProps.password) {
      const password = this.props.password;
      const result = this.strengthTester.check(password);

      if (result.strengthCode.indexOf('WEAK') >= 0) {
        this.output = 'weak';
      } else if (result.strengthCode.indexOf('STRONG') >= 0) {
        this.output = 'strong';
      } else {
        this.output = 'reasonable';
      }
    }
  }

  render() {
    if (!this.props.password) {
      return null;
    }

    return (
      <div>
        <FormattedMessage id={'stripes-smart-components.passwordStrength.' + this.output} />
      </div>
    );
  }
}

export default PasswordStrength;

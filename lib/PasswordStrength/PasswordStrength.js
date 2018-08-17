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
    if (this.props.password !== prevProps.password && !!this.props.password) {
      const password = this.props.password;
      const result = this.strengthTester.check(password);

      switch (true) {
        case result.strengthCode.indexOf('WEAK') >= 0:
          this.output = 'weak';
          break;
        case result.strengthCode.indexOf('STRONG') >= 0:
          this.output = 'strong';
          break;
        default:
          this.output = 'reasonable';
          break;
      }
    }
  }

  render() {
    const password = this.props.password;
    if (!password) {
      return false;
    }

    return (
      <div aria-live="polite">
        <FormattedMessage id={'stripes-smart-components.password-strength.' + this.output} />
      </div>
    );
  }
}

export default PasswordStrength;

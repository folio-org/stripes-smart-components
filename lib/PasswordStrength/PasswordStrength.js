import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import taiPasswordStrength from 'tai-password-strength';
import { withStripes } from '@folio/stripes-core/src/StripesContext';

class PasswordStrength extends React.Component {
  static propTypes = {
    dataSource: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
  }

  render() {
    const password = this.props.dataSource;
    if (!password) {
      return false;
    }

    const strengthTester = new taiPasswordStrength.PasswordStrength();
    strengthTester.addCommonPasswords(taiPasswordStrength.commonPasswords);
    strengthTester.addTrigraphMap(taiPasswordStrength.trigraphs);
    const result = strengthTester.check(password);
    let output = 'weak';

    switch (true) {
      case result.strengthCode.indexOf('WEAK') >= 0:
        output = 'weak';
        break;
      case result.strengthCode.indexOf('STRONG') >= 0:
        output = 'strong';
        break;
      default:
        output = 'reasonable';
        break;
    }

    return (
      <div>
        <FormattedMessage id={'stripes-smart-components.password-strength.' + output}/>
      </div>
    );
  }
}

export default withStripes(PasswordStrength);

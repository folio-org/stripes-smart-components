import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import taiPasswordStrength from 'tai-password-strength';
import { Col, InfoPopover, Row, TextField } from '@folio/stripes-components';
import camelCase from 'lodash/camelCase';
import classNames from 'classnames';
import css from './PasswordSrength.css';

const passwordStrengthTypes = ['VERY_WEAK', 'WEAK', 'REASONABLE', 'STRONG', 'VERY_STRONG'];
const defaultPasswordStrengthType = camelCase(passwordStrengthTypes[0]);

class PasswordStrength extends React.Component {
  static propTypes = {
    /**
     * Properties for column that includes textInput
     */
    inputColProps: PropTypes.object,
    /**
     * Properties for column that includes password strength meter
     */
    passwordMeterColProps: PropTypes.object,
    /**
     * Is password strength meter hidden
     */
    passwordStrengthHidden: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.strengthTester = new taiPasswordStrength.PasswordStrength();
    this.strengthTester.addCommonPasswords(taiPasswordStrength.commonPasswords);
    this.strengthTester.addTrigraphMap(taiPasswordStrength.trigraphs);
    this.outputTypes = this.getOutputTypes();
  }

  getOutputTypes() {
    const result = {};

    passwordStrengthTypes.forEach((element) => {
      result[element] = camelCase(element);
    });

    return result;
  }

  render() {
    const { meta: { valid, dirty }, input: { value } } = this.props;
    const { inputColProps, passwordMeterColProps, passwordStrengthHidden, ...rest } = this.props;
    const isVisible = valid && !passwordStrengthHidden && dirty;
    const result = this.strengthTester.check(value);
    const output = this.outputTypes[result.strengthCode] || defaultPasswordStrengthType;

    return (
      <Row>
        <Col xs={6} {...inputColProps}>
          <TextField {...rest} />
        </Col>
        <Col xs={4} {...passwordMeterColProps} aria-live="polite">
          { isVisible &&
            <div className="password-strength">
              <div className={css['password-strength__label']}>
                <FormattedMessage
                  id="stripes-smart-components.passwordStrength.label"
                />
              </div>
              <div
                className={classNames(css.indicator__container, css[`indicator__container--${output}`])}
              >
                <div className={css.indicator__item} />
                <div className={css.indicator__item} />
                <div className={css.indicator__item} />
                <div className={css.indicator__item} />
                <div className={css.indicator__item} />
              </div>
              <div className={css['password-strength-text__wrapper']}>
                <FormattedMessage
                  id={`stripes-smart-components.passwordStrength.${output}`}
                />
                <InfoPopover
                  content={
                    <FormattedMessage
                      id="stripes-smart-components.passwordStrength.infoPopoverText"
                    />
                  }
                />
              </div>
            </div>}
        </Col>
      </Row>
    );
  }
}

export default PasswordStrength;

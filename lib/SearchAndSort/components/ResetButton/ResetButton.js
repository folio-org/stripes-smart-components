/**
 * Reset Button
 *
 * A delayed disapearable button
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames'; /* eslint-disable-line import/no-extraneous-dependencies */
import { Button, Icon } from '@folio/stripes-components';
import css from './ResetButton.css';

export default class ResetButton extends Component {
  static propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    id: PropTypes.string,
    label: PropTypes.node,
    onClick: PropTypes.func.isRequired,
    rootClassName: PropTypes.string,
  }

  render() {
    const {
      id,
      label,
      className,
      disabled,
      onClick,
      rootClassName,
      ...restProps
    } = this.props;
    return (
      <div className={classnames(css.resetButtonRoot, rootClassName)}>
        <Button
          buttonStyle="none"
          id={id}
          onClick={onClick}
          disabled={disabled}
          buttonClass={classnames(css.button, className)}
          {...restProps}
        >
          <Icon size="small" icon="times-circle-solid">
            {label}
          </Icon>
        </Button>
      </div>
    );
  }
}

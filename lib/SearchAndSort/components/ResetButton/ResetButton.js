/**
 * Reset Button
 *
 * A delayed disapearable button
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import camelCase from 'lodash/camelCase';
import classnames from 'classnames'; /* eslint-disable-line import/no-extraneous-dependencies */
import { Transition } from 'react-transition-group'; /* eslint-disable-line import/no-extraneous-dependencies */
import { Button, Icon } from '@folio/stripes-components';
import css from './ResetButton.css';

export default class ResetButton extends Component {
  static propTypes = {
    id: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    label: PropTypes.node,
    visible: PropTypes.bool,
    className: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      fasterExitTransition: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.onExited = this.onExited.bind(this);
  }

  /**
   * Handle button click
   */
  handleClick(e) {
    // Activate a faster transition when the button is clicked
    this.setState({
      fasterExitTransition: true,
    });

    // Fire onClick callback passed as a required prop
    this.props.onClick(e);
  }

  /**
   * Disable/reset fast transition once the reset button is faded out
   */
  onExited() {
    this.setState({
      fasterExitTransition: false,
    });
  }

  render() {
    const { id, label, className, visible, ...rest } = this.props;
    return (
      <div className={css.resetButtonRoot}>
        <Transition in={visible} timeout={1000} onExited={this.onExited}>
          {
            state => (
              <div className={classnames(css.transition, css[camelCase(`transition ${state}`)], { [css.fasterExitTransition]: this.state.fasterExitTransition })}>
                <Button
                  buttonStyle="none"
                  id={id}
                  {...rest}
                  onClick={this.handleClick}
                  disabled={!visible}
                  buttonClass={classnames(css.button, className)}
                >
                  <Icon size="small" icon="clearX" />
                  {label}
                </Button>
              </div>
            )
          }
        </Transition>
      </div>
    );
  }
}

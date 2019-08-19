import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import {
  Badge,
  Button,
  Icon,
  Layout,
} from '@folio/stripes-components';

import css from './SearchButton.css';

const visiblePanelIcons = ['chevron-left', 'search'];
const hiddenPanelIcons = ['search', 'chevron-right'];
const icons = ['chevron-left', 'search', 'badge', 'chevron-right'];

export default class SearchButton extends Component {
  static propTypes = {
    ariaLabel: PropTypes.string,
    badge: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    onClick: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
  }

  renderIcons = (badge) => {
    const visibleIcons = this.props.visible ? visiblePanelIcons : hiddenPanelIcons;

    return icons.map((iconName) => {
      if (iconName === 'badge') {
        return (badge &&
          <Badge key={iconName} className={css.badge}>
            {badge}
          </Badge>
        );
      }

      return (
        <Icon
          iconRootClass={classnames(
            css.icon,
            { [css.hidden]: !visibleIcons.includes(iconName) },
            { [css.arrow]: iconName.includes('chevron') },
          )}
          size="medium"
          icon={iconName}
          key={iconName}
        />
      );
    });
  }

  render() {
    const {
      ariaLabel,
      badge,
      onClick,
      visible,
      ...rest
    } = this.props;

    const buttonClass = classnames(
      css.button,
      { [css.hasBadge]: typeof badge !== 'undefined' },
    );

    const iconWrapperClass = classnames(
      'display-flex',
      'flex-align-items-center',
      css.inner,
      { [css.moved]: !visible },
    );

    return (
      <Button
        buttonStyle="none"
        buttonClass={buttonClass}
        aria-label={ariaLabel}
        onClick={onClick}
        {...rest}
      >
        <Layout className={iconWrapperClass}>
          {this.renderIcons(badge)}
        </Layout>
      </Button>
    );
  }
}

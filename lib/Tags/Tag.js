import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Badge, Button, Icon } from '@folio/stripes-components';

import css from './Tags.css';

export default class Tag extends React.Component {
  static propTypes = {
    onRemove: PropTypes.func.isRequired,
    tag: PropTypes.string,
  };

  render() {
    const { tag, onRemove } = this.props;

    return (
      <Badge className={css.tag} color="primary">
        <span className={css.tagText}>{tag}</span>
        <FormattedMessage id="stripes-smart-components.deleteTag">
          {ariaLabel => (
            <Button
              onClick={() => onRemove(tag)}
              size="small"
              paddingSide0
              marginBottom0
              buttonStyle="primary"
              aria-label={ariaLabel}
            >
              <Icon size="small" icon="times" color="rgba(255, 255, 255, 1)" />
            </Button>
          )}
        </FormattedMessage>
      </Badge>
    );
  }
}

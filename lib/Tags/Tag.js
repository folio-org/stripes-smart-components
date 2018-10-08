import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Badge, Button, Icon } from '@folio/stripes-components';

import css from './Tags.css';

class Tag extends React.Component {
  static propTypes = {
    intl: intlShape,
    onRemove: PropTypes.func.isRequired,
    tag: PropTypes.string,
  };

  render() {
    const { intl: { formatMessage }, tag, onRemove } = this.props;

    return (
      <Badge className={css.tag} color="primary">
        <span className={css.tagText}>{tag}</span>
        <Button
          onClick={() => onRemove(tag)}
          size="small"
          paddingSide0
          marginBottom0
          buttonStyle="primary"
          aria-label={formatMessage({ id: 'stripes-smart-components.deleteTag' })}
        >
          <Icon size="small" icon="closeX" color="rgba(255, 255, 255, 1)" />
        </Button>
      </Badge>
    );
  }
}

export default injectIntl(Tag);

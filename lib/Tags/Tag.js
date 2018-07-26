import React from 'react';
import PropTypes from 'prop-types';
import Badge from '@folio/stripes-components/lib/Badge';
import Icon from '@folio/stripes-components/lib/Icon';
import Button from '@folio/stripes-components/lib/Button';
import { withStripes } from '@folio/stripes-core/src/StripesContext';

import css from './Tags.css';

class Tag extends React.Component {
  static propTypes = {
    tag: PropTypes.string,
    onRemove: PropTypes.func.isRequired,
    stripes: PropTypes.object,
  };

  render() {
    const { tag, stripes, onRemove } = this.props;
    const formatMsg = stripes.intl.formatMessage;

    return (
      <Badge className={css.tag} color="primary">
        <span>{tag}</span>
        <Button onClick={() => onRemove(tag)} size="small" paddingSide0 marginBottom0 buttonStyle="primary" aria-label={formatMsg({ id: 'stripes-smart-components.deleteTag' })}>
          <Icon size="small" icon="closeX" color="rgba(255, 255, 255, 1)" />
        </Button>
      </Badge>
    );
  }
}

export default withStripes(Tag);

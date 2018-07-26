import React from 'react';
import PropTypes from 'prop-types';
import Badge from '@folio/stripes-components/lib/Badge';

import css from './Tags.css';

class TagsList extends React.Component {
  static propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string),
    onRemove: PropTypes.func,
  };

  render() {
    const { tags } = this.props;

    return (
      <div>
        {tags.map(tag => (<Badge key={tag} color="primary" size="small">{tag}</Badge>))}
      </div>
    );
  }
}

export default TagsList;

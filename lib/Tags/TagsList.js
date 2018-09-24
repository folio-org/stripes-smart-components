import React from 'react';
import PropTypes from 'prop-types';

import Tag from './Tag';

class TagsList extends React.Component {
  static propTypes = {
    onRemove: PropTypes.func.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
  };

  render() {
    const { tags, onRemove } = this.props;

    return (
      <div>
        {tags.map(tag => (<Tag tag={tag} key={tag} onRemove={onRemove} />))}
      </div>
    );
  }
}

export default TagsList;

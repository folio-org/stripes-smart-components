import React from 'react';
import PropTypes from 'prop-types';

class UserName extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired, // eslint-disable-line
    resources: PropTypes.shape({
      user: PropTypes.object,
    }).isRequired,
  };

  static manifest = Object.freeze({
    user: {
      type: 'okapi',
      path: 'users/!{id}',
    },
  });

  render() {
    const { user } = this.props.resources;
    if (!user || !user.hasLoaded || user.records.length !== 1) return null;

    const { firstName, lastName } = user.records[0].personal;
    const displayName = firstName ? `${lastName}, ${firstName}` : lastName;

    return <span to={`/users/view/${user.id}`}>{displayName}</span>;
  }
}

export default UserName;

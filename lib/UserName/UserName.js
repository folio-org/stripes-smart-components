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
    let { user } = this.props.resources;
    if (!user || !user.hasLoaded || user.records.length !== 1) return null;

    user = user.records[0];

    return <span to={`/users/view/${user.id}`}>{user.personal.lastName}, {user.personal.firstName}</span>;
  }
}

export default UserName;

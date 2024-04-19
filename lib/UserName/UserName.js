import React from 'react';
import PropTypes from 'prop-types';

class UserName extends React.Component {
  static manifest = Object.freeze({
    user: {
      type: 'okapi',
      path: 'users/!{id}',
    },
  });

  static propTypes = {
    // id is present in the manifest
    id: PropTypes.string.isRequired, // eslint-disable-line
    resources: PropTypes.shape({
      user: PropTypes.object,
    }).isRequired,
  };

  render() {
    const { user } = this.props.resources;
    if (!user || !user.hasLoaded || user.records?.length !== 1) return null;

    let firstName = '';
    let lastName = '';
    if (user.records[0].personal) {
      ({ firstName, lastName } = user.records[0].personal);
    }

    let displayName;
    if (lastName && firstName) {
      displayName = `${lastName}, ${firstName}`;
    } else if (lastName) {
      displayName = lastName;
    } else if (user.records[0].username) {
      displayName = user.records[0].username;
    }

    return <span>{displayName}</span>;
  }
}

export default UserName;

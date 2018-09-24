import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import UserName from './UserName';

class UserLink extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.connectedUserName = props.stripes.connect(UserName);
  }

  render() {
    return (
      <Link to={`/users/view/${this.props.id}`}>
        <this.connectedUserName {...this.props} />
      </Link>
    );
  }
}

export default UserLink;

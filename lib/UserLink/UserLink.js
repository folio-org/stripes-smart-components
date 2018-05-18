import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import UserName from '../UserName';
import css from './UserLink.css';

class UserLink extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func,
      connect: PropTypes.func,
    }).isRequired,
    displayBlock: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.connectedUserName = props.stripes.connect(UserName);
  }

  render() {
    const { displayBlock, ...props } = this.props;
    const className = `${css.userLink} ${displayBlock ? css.displayBlock : ''}`;

    const Container = this.props.stripes.hasPerm('ui-users.view') ? Link : 'span';

    return (
      <Container to={`/users/view/${props.id}`} className={className}>
        <this.connectedUserName {...props} />
      </Container>
    );
  }
}

export default UserLink;

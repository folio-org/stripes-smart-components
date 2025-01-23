import PropTypes from 'prop-types';

import { useStripes } from '@folio/stripes-core';
import { getFullName } from '@folio/stripes-util';
import { TextLink } from '@folio/stripes-components';

/**
 * LinkedUser
 * Link to a user-details record if permissions allow,
 * or return a plaintext name.
 */
const LinkedUser = ({ user, formatter = getFullName }) => {
  const stripes = useStripes();

  return stripes.hasPerm('ui-users.view') ? (
    <TextLink to={`/users/preview/${user.id}?query=${user.username}`}>
      {formatter(user)}
    </TextLink>
  ) : (
    <>{formatter(user)}</>
  );
};

LinkedUser.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
  }),
  formatter: PropTypes.func,
};

export default LinkedUser;

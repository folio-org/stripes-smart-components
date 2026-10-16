import PropTypes from 'prop-types';

import { useStripes, requestRegistryLink } from '@folio/stripes-core';
import { getFullName } from '@folio/stripes-util';
import { TextLink } from '@folio/stripes-components';

/**
 * LinkedUser
 * Link to a user-details record if permissions allow,
 * or return a plaintext name.
 */
const LinkedUser = ({ user, formatter = getFullName }) => {
  const stripes = useStripes();

  if (!stripes.hasPerm('ui-users.view')) {
    return <>{formatter(user)}</>;
  }

  const linkTemplate = requestRegistryLink('user');
  if (!linkTemplate) {
    return <>{formatter(user)}</>;
  }

  const to = `${linkTemplate.replace(':id', user.id)}?query=${user.username}`;

  return (
    <TextLink to={to}>
      {formatter(user)}
    </TextLink>
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

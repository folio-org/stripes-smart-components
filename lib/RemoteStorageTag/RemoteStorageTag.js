import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { useRemoteStorageMappings } from '../utils';

const RemoteStorageTag = ({ location }) => {
  const remoteMap = useRemoteStorageMappings();
  const intl = useIntl();

  return (location.id in remoteMap) && `(${intl.formatMessage({ id: 'stripes-smart-components.remoteLabel' })})`;
};

RemoteStorageTag.propTypes = {
  location: PropTypes.object.isRequired,
};

export default RemoteStorageTag;

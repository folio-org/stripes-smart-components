import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { useRemoteStorageMappings } from '../utils';

const RemoteStorageTag = ({ location }) => {
  const remoteMap = useRemoteStorageMappings();
  const intl = useIntl();
  const remoteLabel = `(${intl.formatMessage({ id: 'stripes-smart-components.remoteLabel' })})`;

  return (
    remoteMap && (location.id in remoteMap)
  ) ? remoteLabel : '';
};

RemoteStorageTag.propTypes = {
  location: PropTypes.object.isRequired,
};

export default RemoteStorageTag;

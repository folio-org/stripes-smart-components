import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useStripes } from '@folio/stripes-core';

import { useRemoteStorageMappings } from '../utils';

const RemoteStorageTag = ({ location }) => {
  const stripes = useStripes();
  const remoteMap = useRemoteStorageMappings();
  const intl = useIntl();
  const withRemoteStorage = (
    stripes.hasInterface('remote-storage-configurations') && stripes.hasInterface('remote-storage-mappings')
  );

  if (withRemoteStorage) {
    return (location.id in remoteMap) && `(${intl.formatMessage({ id: 'stripes-smart-components.remoteLabel' })})`;
  }
  return '';
};

RemoteStorageTag.propTypes = {
  location: PropTypes.object.isRequired,
};

export default RemoteStorageTag;

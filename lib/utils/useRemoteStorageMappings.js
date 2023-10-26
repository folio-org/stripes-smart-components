import { useQuery } from 'react-query';

import { useOkapiKy, useStripes } from '@folio/stripes-core';

const API = 'remote-storage/mappings';
const LIMIT = 1000;

const useRemoteStorageMappings = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();

  const withRemoteStorage = stripes.hasInterface('remote-storage-mappings');
  stripes.logger.log('interface', `withRemoteStorage: ${withRemoteStorage}`);

  const searchParams = { limit: LIMIT };
  const queryKey = [API, searchParams];
  const queryFn = () => ky(API, { searchParams }).json();

  const { data, error, status } = useQuery({ queryKey, queryFn, enabled: withRemoteStorage });
  stripes.logger.log('interface', `status is ${status}`, error);

  const records = data?.mappings ?? [];

  return Object.fromEntries(records.map(r => [r.folioLocationId, r.configurationId]));
};

export default useRemoteStorageMappings;

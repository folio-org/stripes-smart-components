import { useQuery } from 'react-query';

import { useOkapiKy, useStripes } from '@folio/stripes-core';

const API = 'remote-storage/mappings';
const LIMIT = 1000;

const useRemoteStorageMappings = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();

  const withRemoteStorage = (
    stripes.hasInterface('remote-storage-configurations') && stripes.hasInterface('remote-storage-mappings')
  );

  const searchParams = { limit: LIMIT };
  const queryKey = [API, searchParams];
  const queryFn = () => ky(API, { searchParams }).json();

  const { data } = useQuery({ queryKey, queryFn });

  const records = data?.mappings ?? [];

  if (withRemoteStorage) {
    return Object.fromEntries(records.map(r => [r.folioLocationId, r.configurationId]));
  }
  return {};
};

export default useRemoteStorageMappings;

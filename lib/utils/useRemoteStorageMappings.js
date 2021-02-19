import { useQuery } from 'react-query';

import { useOkapiKy } from '@folio/stripes-core';

const API = 'remote-storage/mappings';
const LIMIT = 1000;

const useRemoteStorageMappings = () => {
  const ky = useOkapiKy();

  const searchParams = { limit: LIMIT };
  const queryKey = [API, searchParams];
  const queryFn = () => ky(API, { searchParams }).json();

  const { data } = useQuery({ queryKey, queryFn });

  const records = data?.mappings ?? [];

  return Object.fromEntries(records.map(r => [r.folioLocationId, r.configurationId]));
};

export default useRemoteStorageMappings;

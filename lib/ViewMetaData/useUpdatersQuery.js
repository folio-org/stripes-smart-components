import { useQuery } from 'react-query';

import { useOkapiKy } from '@folio/stripes-core';

const DEFAULT_DATA = [];

export const useUpdatersQuery = (userIds, options = {}) => {
  const {
    enabled = true,
    tenantId: targetTenantId, // Target tenant ID to fetch users from
  } = options;

  const ky = useOkapiKy({ tenant: targetTenantId }); // If tenantId is undefined, it uses the current tenant

  const {
    data: updaters,
    ...rest
  } = useQuery({
    queryKey: ['metadata-updaters', userIds, targetTenantId],
    queryFn: async ({ signal }) => {
      const searchParams = {
        query: [...new Set(userIds.map(i => `id==${i}`))].join(' or '),
      };

      const users = await ky.get('users', { searchParams, signal })
        .json()
        .then((res) => res.users)
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e); // Log the error but don't throw to avoid breaking the UI

          return [];
        });

      return users;
    },
    enabled: enabled && !!userIds?.length,
    ...options
  });

  return {
    updaters: updaters || DEFAULT_DATA,
    ...rest,
  };
};

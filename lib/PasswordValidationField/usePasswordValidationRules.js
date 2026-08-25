import { useQuery } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes-core';

export const usePasswordValidationRules = () => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'password-validation-rules' });

  const { data } = useQuery(
    [namespace],
    async ({ signal }) => {
      const response = await ky.get('tenant/rules', {
        searchParams: {
          limit: 100,
          query: 'ruleState=="ENABLED"'
        },
        signal,
      }).json();

      return response.rules;
    }
  );

  return { rules: data };
};

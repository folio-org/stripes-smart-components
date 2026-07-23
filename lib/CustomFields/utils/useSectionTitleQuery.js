import { useQuery } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes-core';

import getConfigName from './getConfigName';

const DEFAULT = {};

const useSectionTitleQuery = ({
  moduleName,
  configNamePrefix,
  scope,
  enabled = true,
}) => {
  const [namespace] = useNamespace({ key: 'customFields' });
  const ky = useOkapiKy();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    [namespace, scope || moduleName, configNamePrefix],
    async ({ signal }) => {
      const configName = getConfigName(configNamePrefix);

      const url = scope
        ? `settings/entries?query=(scope==${scope} and key==${configName})`
        : `configurations/entries?query=(module==${moduleName} and configName==${configName})`;

      const response = await ky.get(url, { signal }).json();

      const configs = scope
        ? response.items
        : response.configs;

      return configs?.[0];
    },
    {
      enabled,
    }
  );

  return {
    sectionTitle: data || DEFAULT,
    isLoadingSectionTitle: isLoading,
    isSectionTitleError: isError,
    refetchSectionTitle: refetch,
  };
};

export default useSectionTitleQuery;

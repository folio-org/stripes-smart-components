import { useState, useEffect, useCallback } from 'react';

import makeRequest from './makeRequest';

const useSectionTitleFetch = (okapi, moduleName) => {
  const [sectionTitleLoading, setSectionTitleLoading] = useState(false);
  const [sectionTitle, setSectionTitle] = useState(null);
  const [sectionTitleHasError, setSectionTitleHasError] = useState(false);

  const makeOkapiRequest = useCallback(
    makeRequest(okapi)(),
    [okapi.token, okapi.tenant, okapi.url]
  );

  useEffect(() => {
    const fetchCustomFields = async () => {
      setSectionTitleLoading(true);

      const response = await makeOkapiRequest(`configurations/entries?query=(module==${moduleName} and configName==custom_fields_label)`)({
        method: 'GET',
      });

      if (response.ok) {
        const { configs } = await response.json();

        setSectionTitle(configs);
      } else {
        setSectionTitleHasError(true);
      }
    };

    if (!sectionTitleLoading) {
      fetchCustomFields();
    }
  });

  return {
    sectionTitle,
    sectionTitleLoading,
    sectionTitleHasError,
  };
};

export default useSectionTitleFetch;

import { useState, useEffect, useCallback } from 'react';

import makeRequest from './makeRequest';
import getConfigName from './getConfigName';

const useSectionTitleFetch = (okapi, moduleName, configNamePrefix) => {
  const [sectionTitleLoaded, setSectionTitleLoaded] = useState(false);
  const [sectionTitle, setSectionTitle] = useState({});
  const [sectionTitleFetchFailed, setSectionTitleFetchFailed] = useState(false);

  const makeOkapiRequest = useCallback(
    (url) => makeRequest({ token: okapi.token, tenant: okapi.tenant, url: okapi.url })()(url),
    [okapi.token, okapi.tenant, okapi.url]
  );

  useEffect(() => {
    let isMounted = true;
    const configName = getConfigName(configNamePrefix);
    const url = `configurations/entries?query=(module==${moduleName} and configName==${configName})`;

    const fetchCustomFields = async () => {
      const response = await makeOkapiRequest(url)({
        method: 'GET',
      });

      if (isMounted) {
        if (response.ok) {
          const { configs } = await response.json();

          if (isMounted) {
            setSectionTitle({ ...configs[0] });
            setSectionTitleLoaded(true);
          }
        } else {
          setSectionTitleFetchFailed(true);
        }
      }
    };

    fetchCustomFields();

    return () => {
      isMounted = false;
    };
  }, [makeOkapiRequest, moduleName, sectionTitleLoaded]);

  return {
    sectionTitle,
    sectionTitleLoaded,
    sectionTitleFetchFailed,
  };
};

export default useSectionTitleFetch;

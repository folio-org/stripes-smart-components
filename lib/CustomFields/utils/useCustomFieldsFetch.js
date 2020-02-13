import { useState, useEffect, useCallback } from 'react';

import makeRequest from './makeRequest';

const useCustomFieldsFetch = (okapi, backendModuleId) => {
  const [customFieldsLoaded, setCustomFieldsLoaded] = useState(false);
  const [customFields, setCustomFields] = useState(null);
  const [hasError, setHasError] = useState(false);

  const makeOkapiRequest = useCallback(
    makeRequest(okapi)(backendModuleId),
    [backendModuleId, okapi.token, okapi.tenant, okapi.url]
  );

  useEffect(() => {
    const fetchCustomFields = async () => {
      const response = await makeOkapiRequest('custom-fields')({
        method: 'GET',
      });

      if (response.ok) {
        const { customFields: requestBody } = await response.json();

        setCustomFields(requestBody);
        setCustomFieldsLoaded(true);
      } else {
        setHasError(true);
      }
    };

    if (backendModuleId) {
      fetchCustomFields();
    }
  }, [backendModuleId, makeOkapiRequest]);

  return {
    customFields,
    customFieldsLoaded,
    hasError,
  };
};

export default useCustomFieldsFetch;

import { useState, useEffect, useCallback } from 'react';
import makeRequest from './makeRequest';

const useCustomFieldsFetch = (okapi, backendModuleId) => {
  const [customFieldsLoaded, setCustomFieldsLoaded] = useState(false);
  const [customFields, setCustomFields] = useState(null);
  const makeOkapiRequest = useCallback(
    makeRequest(okapi)(backendModuleId),
    [backendModuleId, okapi.token, okapi.tenant, okapi.url]
  );

  useEffect(() => {
    const fetchCustomFields = async () => {
      const response = await makeOkapiRequest('custom-fields')({
        method: 'GET',
      });

      const { customFields: requestBody } = await response.json();

      setCustomFields(requestBody);
      setCustomFieldsLoaded(true);
    };

    if (backendModuleId) {
      fetchCustomFields();
    }
  }, [backendModuleId, makeOkapiRequest]);

  return {
    customFields,
    customFieldsLoaded,
  };
};

export default useCustomFieldsFetch;

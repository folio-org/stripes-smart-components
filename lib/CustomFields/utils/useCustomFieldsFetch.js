import { useState, useEffect } from 'react';
import makeRequest from './makeRequest';

const useCustomFieldsFetch = (okapi, backendModuleId) => {
  const [customFieldsLoaded, setCustomFieldsLoaded] = useState(false);
  const [customFields, setCustomFields] = useState(null);

  useEffect(() => {
    const fetchCustomFields = async () => {
      const makeOkapiRequest = makeRequest(okapi)(backendModuleId);
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
  }, [backendModuleId, okapi.token, okapi.tenant, okapi.url]);

  return {
    customFields,
    customFieldsLoaded,
  };
};

export default useCustomFieldsFetch;

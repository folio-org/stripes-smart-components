import { useState, useEffect, useCallback } from 'react';

import makeRequest from './makeRequest';

const useCustomFieldsFetch = (okapi, backendModuleId, entityType) => {
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
        const fieldsFilteredByEntityType = requestBody.filter(customField => customField.entityType === entityType);

        setCustomFields(fieldsFilteredByEntityType);
        setCustomFieldsLoaded(true);
      } else {
        setHasError(true);
      }
    };

    if (backendModuleId) {
      fetchCustomFields();
    }
  }, [backendModuleId, makeOkapiRequest, entityType]);

  return {
    customFields,
    customFieldsLoaded,
    hasError,
  };
};

export default useCustomFieldsFetch;

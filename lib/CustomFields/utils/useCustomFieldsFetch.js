import { useState, useEffect, useCallback } from 'react';

import makeRequest from './makeRequest';

// max signed int value, specified in mod-customfields API documentation
const MAX_RECORDS = 2147483647;

const useCustomFieldsFetch = (okapi, backendModuleId, entityType) => {
  const [customFieldsLoaded, setCustomFieldsLoaded] = useState(false);
  const [customFields, setCustomFields] = useState(null);
  const [customFieldsFetchFailed, setCustomFieldsFetchFailed] = useState(false);

  const makeOkapiRequest = useCallback(
    makeRequest(okapi)(backendModuleId),
    [backendModuleId, okapi.token, okapi.tenant, okapi.url]
  );

  useEffect(() => {
    let isMounted = true;
    const fetchCustomFields = async () => {
      const response = await makeOkapiRequest(`custom-fields?limit=${MAX_RECORDS}`)({
        method: 'GET',
      });

      if (isMounted) {
        if (response.ok) {
          const { customFields: requestBody } = await response.json();
          const fieldsFilteredByEntityType = requestBody.filter(customField => customField.entityType === entityType);

          setCustomFields(fieldsFilteredByEntityType);
          setCustomFieldsLoaded(true);
        } else {
          setCustomFieldsFetchFailed(true);
        }
      }
    };

    if (backendModuleId) {
      fetchCustomFields();
    }

    return () => {
      isMounted = false;
    };
  }, [backendModuleId, makeOkapiRequest, entityType]);

  return {
    customFields,
    customFieldsLoaded,
    customFieldsFetchFailed,
    setCustomFields,
  };
};

export default useCustomFieldsFetch;

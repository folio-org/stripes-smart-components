import { useState, useEffect, useCallback } from 'react';

import makeRequest from './makeRequest';
import { fieldTypes } from '../constants';

// max signed int value, specified in mod-customfields API documentation
const MAX_RECORDS = 2147483647;

// Validate custom field data to prevent crashes from invalid BE data
const isValidCustomField = (customField) => {
  if (!customField || typeof customField !== 'object') {
    return false;
  }

  if (typeof customField.id !== 'string' || customField.id.trim() === '') {
    return false;
  }

  if (typeof customField.refId !== 'string' || customField.refId.trim() === '') {
    return false;
  }

  if (typeof customField.name !== 'string' || customField.name.trim() === '') {
    return false;
  }

  if (typeof customField.type !== 'string' || customField.type.trim() === '') {
    return false;
  }

  if (typeof customField.entityType !== 'string' || customField.entityType.trim() === '') {
    return false;
  }

  if (typeof customField.visible !== 'boolean') {
    return false;
  }

  if (typeof customField.required !== 'boolean') {
    return false;
  }

  if (typeof customField.order !== 'number' || customField.order < 0) {
    return false;
  }

  // Validate selectField structure for fields that require it
  const fieldsWithOptions = [
    fieldTypes.SELECT,
    fieldTypes.RADIO_BUTTON_GROUP,
    fieldTypes.MULTISELECT,
  ];

  if (fieldsWithOptions.includes(customField.type)) {
    if (!Array.isArray(customField.selectField?.options?.values)) {
      return false;
    }

    // Validate each option in selectField
    for (const option of customField.selectField.options.values) {
      if (!option || 
        typeof option.id !== 'string' || 
        option.id.trim() === '' ||
        typeof option.value !== 'string' || 
        option.value.trim() === ''
      ) {
        return false;
      }
    }
  }

  return true;
};

const useCustomFieldsFetch = (okapi, backendModuleId, entityType) => {
  const [customFieldsLoaded, setCustomFieldsLoaded] = useState(false);
  const [customFields, setCustomFields] = useState(null);
  const [customFieldsFetchFailed, setCustomFieldsFetchFailed] = useState(false);

  const makeOkapiRequest = useCallback(
    (url) => makeRequest({ token: okapi.token, tenant: okapi.tenant, url: okapi.url })(backendModuleId)(url),
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
          const validCustomFields = (requestBody || []).filter(customField => 
            customField.entityType === entityType && 
            isValidCustomField(customField)
          );

          if (isMounted) {
            setCustomFields(validCustomFields);
            setCustomFieldsLoaded(true);
          }
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

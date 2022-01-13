import { useMemo } from 'react';

import { useStripes } from '@folio/stripes-core';

import useCustomFieldsFetch from './useCustomFieldsFetch';
import { selectModuleId } from '../selectors';

/**
 * A hook which loads custom fields for a given module and entity.
 *
 * @param {String} moduleName - used to set correct `x-okapi-module-id` header when making
 * requests to `mod-custom-fields`.
 * @param {String} entityType - used to filter custom files by particular entity type
 *
 * @return {array} - Return array in a format: [data, isLoading, error]
 *
 * Example usage:
 *
 * const [data, isLoading, error] = useCustomFields('users', 'user');
 *
*/
const useCustomFields = (moduleName, entityType) => {
  const { store: { getState }, okapi } = useStripes();
  const state = getState();
  const moduleId = useMemo(() => selectModuleId(state, moduleName), [state, moduleName]);
  const {
    customFields,
    customFieldsLoaded,
    customFieldsFetchFailed,
  } = useCustomFieldsFetch(okapi, moduleId, entityType);

  return [
    customFields,
    !customFieldsLoaded,
    customFieldsFetchFailed,
  ];
};

export default useCustomFields;

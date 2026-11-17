import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import { fieldTypes } from '../constants';
import makeRequest from './makeRequest';

const isFieldUsed = field => field.count;
const isEntityTypeMatching = entityType => field => entityType === field.entityType;
// Fields that were added in the form but not saved yet cannot have usage statistics.
const isSaved = customField => !customField.id.startsWith('unsaved_');

/**
 * Collects the ids of lookup custom fields that at least one record already refers to.
 *
 * Changing the target entity type of such a field would turn every stored UUID into a
 * dangling reference, so the caller locks the selector for the ids returned here.
 */
const useLookupFieldsStatsFetch = (okapi, backendModuleId, customFields, entityType) => {
  const makeOkapiRequest = useCallback((url) => makeRequest(okapi)(backendModuleId)(url), [okapi, backendModuleId]);

  const getFieldUsageStatistics = useCallback((fieldId) => {
    return makeOkapiRequest(`custom-fields/${fieldId}/stats`)({
      method: 'GET',
    });
  }, [makeOkapiRequest]);

  const [usedLookupFieldIds, setUsedLookupFieldIds] = useState([]);
  const [lookupStatsLoaded, setLookupStatsLoaded] = useState(false);
  const [lookupStatsFetchFailed, setLookupStatsFetchFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchFieldsUsageStatistics = async (fieldsToCheck) => {
      try {
        const responses = await Promise.all(fieldsToCheck.map(({ id }) => getFieldUsageStatistics(id)));

        if (!isMounted) return;

        if (responses.every(({ ok }) => !!ok)) {
          const fieldsUsageData = await Promise.all(responses.map(response => response.json()));

          const usedFieldIds = fieldsUsageData
            .filter(isEntityTypeMatching(entityType))
            .filter(isFieldUsed)
            .map(({ fieldId }) => fieldId);

          if (isMounted) {
            setUsedLookupFieldIds(usedFieldIds);
            setLookupStatsLoaded(true);
          }
        } else {
          setLookupStatsFetchFailed(true);
        }
      } catch (e) {
        // A request that never reached the server must not leave the lock in place
        // silently, so it is reported like a failed response.
        if (isMounted) setLookupStatsFetchFailed(true);
      }
    };

    if (!customFields) return undefined;

    const fieldsToCheck = customFields.filter(
      customField => customField.type === fieldTypes.LOOKUP && isSaved(customField),
    );

    if (fieldsToCheck.length) {
      fetchFieldsUsageStatistics(fieldsToCheck);
    } else {
      setLookupStatsLoaded(true);
    }

    return () => {
      isMounted = false;
    };
  }, [customFields, getFieldUsageStatistics, entityType]);

  return {
    usedLookupFieldIds,
    lookupStatsLoaded,
    lookupStatsFetchFailed,
  };
};

export default useLookupFieldsStatsFetch;

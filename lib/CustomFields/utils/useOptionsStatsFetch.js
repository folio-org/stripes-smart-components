import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import { fieldTypesWithOptions } from '../constants';
import makeRequest from './makeRequest';

const isOptionUsed = option => option.count;
const isEntityTypeMathing = entityType => option => entityType === option.entityType;

const optionsStatsReducer = (currentData, option) => {
  if (option.customFieldId in currentData) {
    return {
      ...currentData,
      [option.customFieldId]: [
        ...currentData[option.customFieldId],
        option.optionId,
      ]
    };
  }

  return {
    ...currentData,
    [option.customFieldId]: [option.optionId],
  };
};

const useOptionsStatsFetch = (okapi, backendModuleId, customFields, entityType) => {
  const makeOkapiRequest = useCallback((url) => makeRequest(okapi)(backendModuleId)(url), [okapi, backendModuleId]);

  const getOptionUsageStatistics = useCallback((fieldId, optionId) => {
    return makeOkapiRequest(`custom-fields/${fieldId}/options/${optionId}/stats`)({
      method: 'GET',
    });
  }, [makeOkapiRequest]);

  const [optionsStats, setOptionsStats] = useState(null);
  const [optionsStatsLoaded, setOptionsStatsLoaded] = useState(false);
  const [optionsStatsFetchFailed, setOptionsStatsFetchFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOptionsUsageStatistics = async () => {
      const promises = customFields.reduce((curr, customField) => {
        if (fieldTypesWithOptions.includes(customField.type)) {
          return [
            ...curr,
            ...customField.selectField.options.values.map(({ id }) => getOptionUsageStatistics(customField.id, id)),
          ];
        }

        return curr;
      }, []);

      const responses = await Promise.all(promises);

      if (isMounted) {
        if (responses.every(({ ok }) => !!ok)) {
          const optionsUsageData = await Promise.all(responses.map(response => response.json()));

          const usedFieldOptions = optionsUsageData
            .filter(isEntityTypeMathing(entityType))
            .filter(isOptionUsed)
            .reduce(optionsStatsReducer, {});

          if (isMounted) {
            setOptionsStats(usedFieldOptions);
            setOptionsStatsLoaded(true);
          }
        } else {
          setOptionsStatsFetchFailed(true);
        }
      }
    };

    if (customFields) {
      fetchOptionsUsageStatistics();
    }

    return () => {
      isMounted = false;
    };
  }, [customFields, getOptionUsageStatistics, entityType]);

  return {
    optionsStats,
    optionsStatsLoaded,
    optionsStatsFetchFailed,
  };
};

export default useOptionsStatsFetch;

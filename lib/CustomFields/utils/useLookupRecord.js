import { useCallback } from 'react';
import {
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes-core';

import { getLookupAdapter } from '../lookup';

const RESOLVED_LABEL_STALE_TIME = 5 * 60 * 1000;

const messageId = key => `stripes-smart-components.customFields.lookup.${key}`;

/**
 * Resolves the UUID stored in a lookup custom field into a display label.
 *
 * Whatever keeps the label from being shown is reported as `messageId`, so that view
 * and edit mode render the same explanation. A deleted record, a record the user may
 * not read, a source this frontend has no adapter for, and a request that failed for
 * any other reason are kept apart: in none of these cases is the reference known to be
 * broken.
 *
 * `cacheRecord` stores a record the finder plugin has just handed over, so the field
 * does not request it again right after it was picked.
 */
const useLookupRecord = ({ refEntityType, id }) => {
  const adapter = getLookupAdapter(refEntityType);
  const ky = useOkapiKy();
  const queryClient = useQueryClient();
  const [namespace] = useNamespace({ key: 'customFieldsLookup' });
  const isEnabled = Boolean(adapter && id);

  const {
    data,
    isLoading,
    error,
  } = useQuery(
    [namespace, refEntityType, id],
    ({ signal }) => ky.get(adapter.resolvePath(id), { signal }).json(),
    {
      enabled: isEnabled,
      staleTime: RESOLVED_LABEL_STALE_TIME,
      retry: false,
    },
  );

  const cacheRecord = useCallback((record) => {
    if (record?.id) {
      queryClient.setQueryData([namespace, refEntityType, record.id], record);
    }
  }, [queryClient, namespace, refEntityType]);

  const label = data ? adapter.toLabel(data) : null;
  const isLoadingRecord = isEnabled && isLoading;

  const getMessageId = () => {
    if (!refEntityType) return messageId('noRefEntityType');
    if (!adapter) return messageId('unknownRefEntityType');
    if (!id || isLoadingRecord) return null;

    const status = error?.response?.status;

    if (status === 403) return messageId('noPermission');
    if (status === 404) return messageId('notFound');
    if (error) return messageId('loadFailed');
    if (data && !label) return messageId('notFound');

    return null;
  };

  return {
    label,
    isLoadingRecord,
    messageId: getMessageId(),
    viewPath: isEnabled ? adapter.viewPath(id) : null,
    cacheRecord,
  };
};

export default useLookupRecord;

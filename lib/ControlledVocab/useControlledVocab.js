import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useNamespace, useOkapiKy, useStripes } from '@folio/stripes-core';

export const RECORDS_LIMIT = 2000;

/**
 * Data management for a controlled vocabulary: fetches the records and the
 * users who last updated them, and provides create/update/delete mutations.
 *
 * @param {object} props
 * @param {string} props.baseUrl API path, e.g. "groups"
 * @param {string} props.records name of the records property in the response
 * @param {string} [props.sortby='name'] field to sort by
 * @param {string} [props.limitParam='limit'] name of the limit query-param
 * @param {string} [props.tenant] defaults to the current tenant
 * @param {boolean|string} [props.clientGeneratePk=true] true to generate a
 *   UUID `id`; a string to generate the PK under that property name
 * @param {'rest'|'refdata'} [props.actuatorType='rest']
 * @param {function} [props.preCreateHook]
 * @param {function} [props.preUpdateHook]
 */
const useControlledVocab = ({
  baseUrl,
  records,
  sortby = 'name',
  limitParam = 'limit',
  tenant,
  clientGeneratePk = true,
  actuatorType = 'rest',
  preCreateHook = (row) => row,
  preUpdateHook = (row) => row,
}) => {
  const stripes = useStripes();
  const ky = useOkapiKy({ tenant });
  const queryClient = useQueryClient();
  const [namespace] = useNamespace({ key: 'controlled-vocab' });
  const effectiveTenant = tenant || stripes.okapi.tenant;
  const queryKey = [namespace, effectiveTenant, baseUrl, sortby];

  const valuesQuery = useQuery(
    queryKey,
    ({ signal }) => ky.get(baseUrl, {
      searchParams: {
        query: `cql.allRecords=1 sortby ${sortby}`,
        [limitParam]: RECORDS_LIMIT,
      },
      signal,
    }).json(),
    { enabled: !!baseUrl }
  );

  const values = useMemo(() => {
    const data = valuesQuery.data;
    if (!data) return [];
    return (records ? data[records] : data) ?? [];
  }, [valuesQuery.data, records]);

  // look up everybody who updated a value, all at once
  const canReadUsers = stripes.hasPerm('users.collection.get');
  const updaterIds = useMemo(() => [...new Set(
    values.map(v => v.metadata?.updatedByUserId).filter(Boolean)
  )], [values]);

  const updatersQuery = useQuery(
    [namespace, effectiveTenant, 'updaters', updaterIds],
    ({ signal }) => ky.get('users', {
      searchParams: {
        query: updaterIds.map(id => `id=="${id}"`).join(' or '),
        limit: RECORDS_LIMIT,
      },
      signal,
    }).json(),
    { enabled: canReadUsers && updaterIds.length > 0 }
  );

  const updaters = updatersQuery.data?.users ?? [];

  const invalidate = () => queryClient.invalidateQueries([namespace, effectiveTenant, baseUrl]);

  // the refdata API takes every change as a PUT of { values: [...] } to baseUrl
  const putRefdata = (item) => ky.put(baseUrl, { json: { values: [item] } }).json();

  const create = useMutation({
    mutationFn: (item) => {
      // remove non-persistable metadata and rowIndex properties
      // eslint-disable-next-line no-unused-vars
      const { metadata, rowIndex, ...row } = preCreateHook(item);

      if (actuatorType === 'refdata') return putRefdata(row);

      if (clientGeneratePk && !row.id) {
        row[typeof clientGeneratePk === 'string' ? clientGeneratePk : 'id'] = crypto.randomUUID();
      }
      return ky.post(baseUrl, { json: row }).json();
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (item) => {
      // remove non-persistable metadata and rowIndex properties
      // eslint-disable-next-line no-unused-vars
      const { metadata, rowIndex, ...row } = preUpdateHook(item);

      return actuatorType === 'refdata' ?
        putRefdata(row) :
        ky.put(`${baseUrl}/${row.id}`, { json: row });
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (item) => (
      actuatorType === 'refdata' ?
        putRefdata({ id: item.id, _delete: true }) :
        ky.delete(`${baseUrl}/${item.id}`)
    ),
    onSuccess: invalidate,
  });

  return {
    values,
    updaters,
    isLoading: valuesQuery.isLoading,
    isError: valuesQuery.isError,
    isSaving: create.isLoading || update.isLoading,
    isDeleting: remove.isLoading,
    createItem: create.mutateAsync,
    updateItem: update.mutateAsync,
    deleteItem: remove.mutateAsync,
  };
};

export default useControlledVocab;

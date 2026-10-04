import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import useLookupFieldsStatsFetch from './useLookupFieldsStatsFetch';

const okapi = {
  url: 'https://okapi',
  tenant: 'diku',
  token: 'token',
};

const entityType = 'purchase_order';
const backendModuleId = 'mod-orders-storage-1.0.0';

const lookupField = { id: 'field-1', type: 'LOOKUP' };
const unsavedLookupField = { id: 'unsaved_2', type: 'LOOKUP' };
const textField = { id: 'field-3', type: 'TEXTBOX_SHORT' };

const mockResponse = (body, ok = true) => ({
  ok,
  json: jest.fn().mockResolvedValue(body),
});

const renderStatsHook = (customFields) => renderHook(
  () => useLookupFieldsStatsFetch(okapi, backendModuleId, customFields, entityType),
);

describe('useLookupFieldsStatsFetch', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should only request statistics for saved lookup fields', async () => {
    global.fetch.mockResolvedValue(mockResponse({
      fieldId: lookupField.id,
      entityType,
      count: 0,
    }));

    const { result } = renderStatsHook([lookupField, unsavedLookupField, textField]);

    await waitFor(() => expect(result.current.lookupStatsLoaded).toBe(true));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${okapi.url}/custom-fields/${lookupField.id}/stats`,
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-okapi-module-id': backendModuleId }),
      }),
    );
    expect(result.current.usedLookupFieldIds).toEqual([]);
  });

  it('should report a field that is in use', async () => {
    global.fetch.mockResolvedValue(mockResponse({
      fieldId: lookupField.id,
      entityType,
      count: 3,
    }));

    const { result } = renderStatsHook([lookupField]);

    await waitFor(() => expect(result.current.lookupStatsLoaded).toBe(true));

    expect(result.current.usedLookupFieldIds).toEqual([lookupField.id]);
  });

  it('should ignore usage reported for another entity type', async () => {
    global.fetch.mockResolvedValue(mockResponse({
      fieldId: lookupField.id,
      entityType: 'po_line',
      count: 3,
    }));

    const { result } = renderStatsHook([lookupField]);

    await waitFor(() => expect(result.current.lookupStatsLoaded).toBe(true));

    expect(result.current.usedLookupFieldIds).toEqual([]);
  });

  it('should flag a failed request without marking the statistics as loaded', async () => {
    global.fetch.mockResolvedValue(mockResponse({}, false));

    const { result } = renderStatsHook([lookupField]);

    await waitFor(() => expect(result.current.lookupStatsFetchFailed).toBe(true));

    expect(result.current.lookupStatsLoaded).toBe(false);
    expect(result.current.usedLookupFieldIds).toEqual([]);
  });

  it('should flag a request that never reached the server', async () => {
    global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const { result } = renderStatsHook([lookupField]);

    await waitFor(() => expect(result.current.lookupStatsFetchFailed).toBe(true));

    expect(result.current.lookupStatsLoaded).toBe(false);
  });
});

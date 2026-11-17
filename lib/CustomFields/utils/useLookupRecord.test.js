import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes-core';

import useLookupRecord from './useLookupRecord';

const id = 'f0c5e5d2-0000-4000-8000-000000000001';
const organization = { id, name: 'Amazon.com' };

const messageId = key => `stripes-smart-components.customFields.lookup.${key}`;

const httpError = status => Object.assign(new Error(`HTTP ${status}`), { response: { status } });

const renderLookupRecord = (props) => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return renderHook(hookProps => useLookupRecord(hookProps), { wrapper, initialProps: props });
};

describe('useLookupRecord', () => {
  const mockGet = jest.fn();

  beforeEach(() => {
    mockGet.mockReset();
    useOkapiKy.mockReturnValue({ get: mockGet });
  });

  it('should resolve the label through the adapter of the source', async () => {
    mockGet.mockReturnValue({ json: () => Promise.resolve(organization) });

    const { result } = renderLookupRecord({ refEntityType: 'organization', id });

    await waitFor(() => expect(result.current.label).toBe('Amazon.com'));

    expect(mockGet).toHaveBeenCalledWith(`organizations/organizations/${id}`, expect.any(Object));
    expect(result.current.messageId).toBeNull();
    expect(result.current.viewPath).toBe(`/organizations/view/${id}`);
  });

  it('should not request anything without an id', () => {
    const { result } = renderLookupRecord({ refEntityType: 'organization', id: undefined });

    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current.isLoadingRecord).toBe(false);
    expect(result.current.messageId).toBeNull();
  });

  it.each([
    [403, 'noPermission'],
    [404, 'notFound'],
    [500, 'loadFailed'],
  ])('should map a %s response to the %s message', async (status, key) => {
    mockGet.mockReturnValue({ json: () => Promise.reject(httpError(status)) });

    const { result } = renderLookupRecord({ refEntityType: 'organization', id });

    await waitFor(() => expect(result.current.messageId).toBe(messageId(key)));
  });

  it('should report a record whose label is empty as missing', async () => {
    mockGet.mockReturnValue({ json: () => Promise.resolve({ id }) });

    const { result } = renderLookupRecord({ refEntityType: 'organization', id });

    await waitFor(() => expect(result.current.messageId).toBe(messageId('notFound')));
  });

  it('should name a source without an adapter instead of requesting it', () => {
    const { result } = renderLookupRecord({ refEntityType: 'holdings', id });

    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current.messageId).toBe(messageId('unknownRefEntityType'));
  });

  it('should report a field definition without a source', () => {
    const { result } = renderLookupRecord({ refEntityType: undefined, id });

    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current.messageId).toBe(messageId('noRefEntityType'));
  });

  it('should serve a cached record without a request', async () => {
    const { result, rerender } = renderLookupRecord({ refEntityType: 'organization', id: undefined });

    result.current.cacheRecord(organization);
    rerender({ refEntityType: 'organization', id });

    await waitFor(() => expect(result.current.label).toBe('Amazon.com'));

    expect(mockGet).not.toHaveBeenCalled();
  });
});

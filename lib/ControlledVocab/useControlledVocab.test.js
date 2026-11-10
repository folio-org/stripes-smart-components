import { QueryClient, QueryClientProvider } from 'react-query';

import { renderHook, act, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes-core';

import useControlledVocab from './useControlledVocab';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useControlledVocab', () => {
  const ky = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
  const json = (v) => ({ json: () => Promise.resolve(v) });

  beforeEach(() => {
    ky.get.mockReturnValue(json({ things: [{ id: '1', name: 'one' }] }));
    ky.post.mockReturnValue(json({}));
    ky.put.mockReturnValue(json({}));
    useOkapiKy.mockReturnValue(ky);
  });

  afterEach(() => jest.clearAllMocks());

  it('returns the records from the response', async () => {
    const { result } = renderHook(() => useControlledVocab({ baseUrl: 'things', records: 'things' }), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.values).toEqual([{ id: '1', name: 'one' }]);
  });

  it('does not generate a PK when clientGeneratePk is false', async () => {
    const { result } = renderHook(() => useControlledVocab({
      baseUrl: 'things', records: 'things', clientGeneratePk: false,
    }), { wrapper });

    await act(() => result.current.createItem({ name: 'two' }));
    expect(ky.post).toHaveBeenCalledWith('things', { json: { name: 'two' } });
  });

  it('generates the PK under the named property when clientGeneratePk is a string', async () => {
    const { result } = renderHook(() => useControlledVocab({
      baseUrl: 'things', records: 'things', clientGeneratePk: 'uuid',
    }), { wrapper });

    await act(() => result.current.createItem({ name: 'two' }));
    expect(ky.post).toHaveBeenCalledWith('things', {
      json: { name: 'two', uuid: expect.any(String) },
    });
  });

  it('applies preUpdateHook on update', async () => {
    const { result } = renderHook(() => useControlledVocab({
      baseUrl: 'things', records: 'things', preUpdateHook: r => ({ ...r, hooked: 1 }),
    }), { wrapper });

    await act(() => result.current.updateItem({ id: '1', name: 'x' }));
    expect(ky.put).toHaveBeenCalledWith('things/1', { json: { id: '1', name: 'x', hooked: 1 } });
  });
});

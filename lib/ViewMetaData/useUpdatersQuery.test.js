import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes-core';

import { useUpdatersQuery } from './useUpdatersQuery';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const users = [
  { id: '1', firstName: 'Luke', lastName: 'Skywalker' },
  { id: '2', firstName: 'Dart', lastName: 'Waider' },
];
const userIds = users.map(({ id }) => id);

describe('useUpdatersQuery', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve({ users }),
  }));

  beforeEach(() => {
    useOkapiKy.mockReturnValue({ get: mockGet });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users by ids', async () => {
    const { result } = renderHook(() => useUpdatersQuery(userIds), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.updaters).toEqual(users);
    expect(mockGet).toHaveBeenCalledWith('users', {
      searchParams: expect.objectContaining({
        query: userIds.map(id => `id==${id}`).join(' or '),
      }),
      signal: expect.any(AbortSignal),
    });
  });

  it('should not fetch users when userIds is empty', async () => {
    const { result } = renderHook(() => useUpdatersQuery([]), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.updaters).toEqual([]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should return empty array when fetch fails', async () => {
    mockGet.mockReturnValueOnce({
      json: () => Promise.reject(new Error('Test error')),
    });
    const { result } = renderHook(() => useUpdatersQuery(['3']), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.updaters).toEqual([]);
  });
});

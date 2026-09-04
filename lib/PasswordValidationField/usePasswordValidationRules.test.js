import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { useNamespace, useOkapiKy } from '@folio/stripes-core';

import { usePasswordValidationRules } from './usePasswordValidationRules';

const rules = [
  {
    name: 'password_length',
    expression: '^.{8,}$',
    errMessageId: 'password.length.invalid',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('usePasswordValidationRules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNamespace.mockReturnValue(['password-validation-rules']);
  });

  it('fetches enabled password validation rules for the current tenant', async () => {
    const json = jest.fn().mockResolvedValue({ rules });
    const get = jest.fn().mockReturnValue({ json });

    useOkapiKy.mockReturnValue({ get });

    const { result } = renderHook(() => usePasswordValidationRules(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.rules).toEqual(rules));

    expect(useNamespace).toHaveBeenCalledWith({ key: 'password-validation-rules' });
    expect(get).toHaveBeenCalledWith('tenant/rules', {
      searchParams: {
        limit: 100,
        query: 'ruleState=="ENABLED"',
      },
      signal: expect.any(AbortSignal),
    });
    expect(json).toHaveBeenCalledTimes(1);
  });

  it('returns undefined rules while the request is pending', () => {
    const json = jest.fn(() => new Promise(() => {}));
    const get = jest.fn().mockReturnValue({ json });

    useOkapiKy.mockReturnValue({ get });

    const { result } = renderHook(() => usePasswordValidationRules(), {
      wrapper: createWrapper(),
    });

    expect(result.current.rules).toBeUndefined();
    expect(get).toHaveBeenCalledTimes(1);
  });
});

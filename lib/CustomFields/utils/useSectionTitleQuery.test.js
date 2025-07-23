import { act } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import useSectionTitleQuery from './useSectionTitleQuery';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const scope = 'ui-users.custom-fields';
const configNamePrefix = 'prefix';
const moduleName = 'users';

describe('useSectionTitleQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a get request when `scope` is provided', async () => {
    const mockGet = jest.fn().mockReturnValue({
      json: jest.fn().mockResolvedValue({
        items: [{
          value: 'Test Section Title',
        }],
      }),
    });

    const { result } = renderHook(useSectionTitleQuery, {
      wrapper,
      initialProps: {
        scope,
      },
    });

    expect(mockGet).toHaveBeenCalledWith(
      `settings/entries?query=(scope==${scope} and key==custom_fields_label)`,
      expect.anything(),
    );

    expect(result.current).toEqual({
      sectionTitle: {},
      isLoadingSectionTitle: true,
      isSectionTitleError: false,
      refetchSectionTitle: expect.any(Function),
    });

    await act(() => !result.current.isLoading);

    expect(result.current).toEqual({
      sectionTitle: { value: 'Test Section Title' },
      isLoadingSectionTitle: false,
      isSectionTitleError: false,
      refetchSectionTitle: expect.any(Function),
    });
  });

  it('should make a get request when `scope` is not provided', async () => {
    const mockGet = jest.fn().mockReturnValue({
      json: jest.fn().mockResolvedValue({
        configs: [{
          value: 'Test Section Title',
        }],
      }),
    });

    const { result } = renderHook(useSectionTitleQuery, {
      wrapper,
      initialProps: {
        moduleName,
        configNamePrefix,
      },
    });

    expect(mockGet).toHaveBeenCalledWith(
      `configurations/entries?query=(module==${moduleName} and configName==${configNamePrefix}_custom_fields_label)`,
      expect.anything(),
    );

    expect(result.current).toEqual({
      sectionTitle: {},
      isLoadingSectionTitle: true,
      isSectionTitleError: false,
      refetchSectionTitle: expect.any(Function),
    });

    await act(() => !result.current.isLoading);

    expect(result.current).toEqual({
      sectionTitle: { value: 'Test Section Title' },
      isLoadingSectionTitle: false,
      isSectionTitleError: false,
      refetchSectionTitle: expect.any(Function),
    });
  });
});

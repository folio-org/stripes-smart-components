import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { useOkapiKy, useStripes, useNamespace } from '@folio/stripes-core';
import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';

import useCustomFieldsQuery from './useCustomFieldsQuery';
import { selectModuleId } from '../selectors';
import { CUSTOM_FIELDS_SECTION_ID } from '../constants';

jest.mock('../selectors');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockCustomFieldsData = [
  {
    id: '1',
    name: 'Field 1',
    entityType: 'user',
    displayInAccordion: 'custom-section',
    visible: true,
    refId: 'ref-1',
  },
  {
    id: '2',
    name: 'Field 2',
    entityType: 'user',
    displayInAccordion: CUSTOM_FIELDS_SECTION_ID,
    visible: false,
    refId: 'ref-2',
  },
  {
    id: '3',
    name: 'Field 3',
    entityType: 'order',
    displayInAccordion: 'custom-section',
    visible: true,
    refId: 'ref-3',
  },
  {
    id: '4',
    name: 'Field 4',
    entityType: 'user',
    displayInAccordion: undefined, // old custom field without displayInAccordion
    visible: true,
    refId: 'ref-4',
  },
  {
    id: '5',
    name: 'Field 5',
    entityType: 'user',
    displayInAccordion: 'other-section',
    visible: true,
    refId: 'ref-5',
  },
];

const mockModuleId = 'test-module-id';
const mockNamespace = 'customFields';

describe('useCustomFieldsQuery', () => {
  const mockGet = jest.fn();
  const mockGetState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useOkapiKy.mockReturnValue({
      get: mockGet,
    });

    useStripes.mockReturnValue({
      store: {
        getState: mockGetState,
      },
    });

    useNamespace.mockReturnValue([mockNamespace]);
    selectModuleId.mockReturnValue(mockModuleId);
    mockGetState.mockReturnValue({});

    mockGet.mockReturnValue({
      json: jest.fn().mockResolvedValue({
        customFields: mockCustomFieldsData,
      }),
    });
  });

  it('should make a get request with correct parameters', async () => {
    const { result } = renderHook(
      () => useCustomFieldsQuery({
        moduleName: 'users',
      }),
      { wrapper }
    );

    expect(mockGet).toHaveBeenCalledWith('custom-fields', {
      searchParams: {
        limit: 2147483647,
      },
      signal: expect.any(AbortSignal),
      headers: {
        'x-okapi-module-id': mockModuleId,
      },
    });

    expect(result.current).toEqual({
      customFields: null,
      isLoadingCustomFields: true,
      isCustomFieldsError: false,
      refetchCustomFields: expect.any(Function),
    });

    await act(() => !result.current.isLoadingCustomFields);

    expect(result.current).toEqual({
      customFields: mockCustomFieldsData,
      isLoadingCustomFields: false,
      isCustomFieldsError: false,
      refetchCustomFields: expect.any(Function),
    });
  });

  describe('when there is an empty refId field in the data', () => {
    it('should filter out that custom field', async () => {
      mockGet.mockReturnValue({
        json: jest.fn().mockResolvedValue({
          customFields: [
            ...mockCustomFieldsData,
            {
              id: '6',
              name: 'Field 6',
              entityType: 'user',
              displayInAccordion: 'other-section',
              visible: true,
              refId: '', // invalid refId
            },
          ],
        }),
      });

      const { result } = renderHook(
        () => useCustomFieldsQuery({
          moduleName: 'users',
        }),
        { wrapper }
      );

      await act(() => !result.current.isLoadingCustomFields);

      expect(result.current.customFields).toEqual(mockCustomFieldsData);
    });
  });

  it('should filter by entityType when provided', async () => {
    const { result } = renderHook(
      () => useCustomFieldsQuery({
        moduleName: 'users',
        entityType: 'user',
      }),
      { wrapper }
    );

    await act(() => !result.current.isLoadingCustomFields);

    const expectedFields = mockCustomFieldsData.filter(field => field.entityType === 'user');
    expect(result.current.customFields).toEqual(expectedFields);
  });

  it('should filter by sectionId when provided', async () => {
    const { result } = renderHook(
      () => useCustomFieldsQuery({
        moduleName: 'users',
        sectionId: 'custom-section',
      }),
      { wrapper }
    );

    await act(() => !result.current.isLoadingCustomFields);

    const expectedFields = mockCustomFieldsData.filter(
      field => field.displayInAccordion === 'custom-section'
    );
    expect(result.current.customFields).toEqual(expectedFields);
  });

  it('should handle CUSTOM_FIELDS_SECTION_ID correctly', async () => {
    const { result } = renderHook(
      () => useCustomFieldsQuery({
        moduleName: 'users',
        sectionId: CUSTOM_FIELDS_SECTION_ID,
      }),
      { wrapper }
    );

    await act(() => !result.current.isLoadingCustomFields);

    // Should include fields with displayInAccordion === CUSTOM_FIELDS_SECTION_ID or undefined
    const expectedFields = mockCustomFieldsData.filter(
      field => !field.displayInAccordion || field.displayInAccordion === CUSTOM_FIELDS_SECTION_ID
    );
    expect(result.current.customFields).toEqual(expectedFields);
  });

  it('should filter by visibility when isVisible is true', async () => {
    const { result } = renderHook(
      () => useCustomFieldsQuery({
        moduleName: 'users',
        isVisible: true,
      }),
      { wrapper }
    );

    await act(() => !result.current.isLoadingCustomFields);

    const expectedFields = mockCustomFieldsData.filter(field => field.visible);
    expect(result.current.customFields).toEqual(expectedFields);
  });

  it('should apply multiple filters when provided', async () => {
    const { result } = renderHook(
      () => useCustomFieldsQuery({
        moduleName: 'users',
        entityType: 'user',
        sectionId: 'custom-section',
        isVisible: true,
      }),
      { wrapper }
    );

    await act(() => !result.current.isLoadingCustomFields);

    const expectedFields = mockCustomFieldsData.filter(field => (
      field.entityType === 'user' &&
      field.displayInAccordion === 'custom-section' &&
      field.visible
    ));
    expect(result.current.customFields).toEqual(expectedFields);
  });

  it('should return null when no data is available', async () => {
    mockGet.mockReturnValue({
      json: jest.fn().mockResolvedValue({}),
    });

    const { result } = renderHook(
      () => useCustomFieldsQuery({
        moduleName: 'users',
      }),
      { wrapper }
    );

    await act(() => !result.current.isLoadingCustomFields);

    expect(result.current.customFields).toBeNull();
  });

  it('should not make request when moduleId is undefined', () => {
    selectModuleId.mockReturnValue(undefined);

    renderHook(
      () => useCustomFieldsQuery({
        moduleName: 'users',
      }),
      { wrapper }
    );

    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should call selectModuleId with correct parameters', async () => {
    const mockState = { some: 'state' };
    mockGetState.mockReturnValue(mockState);

    await act(() => {
      renderHook(
        () => useCustomFieldsQuery({
          moduleName: 'users',
        }),
        { wrapper }
      );
    });

    expect(selectModuleId).toHaveBeenCalledWith(mockState, 'users');
  });

  it('should refetch data when refetchCustomFields is called', async () => {
    const { result } = renderHook(
      () => useCustomFieldsQuery({
        moduleName: 'users',
      }),
      { wrapper }
    );

    await act(() => !result.current.isLoadingCustomFields);

    mockGet.mockClear();

    await act(async () => {
      await result.current.refetchCustomFields();
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});

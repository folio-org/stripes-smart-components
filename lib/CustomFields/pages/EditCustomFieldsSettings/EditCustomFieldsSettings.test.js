import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';

import { render } from '@folio/jest-config-stripes/testing-library/react';

import {
  useOptionsStatsFetch,
  useCustomFieldsQuery,
} from '../../utils';
import EditCustomFieldsSettings from './EditCustomFieldsSettings';

jest.mock('../../utils', () => {
  return {
    ...jest.requireActual('../../utils'),
    useOptionsStatsFetch: jest.fn(() => ({
      optionsStats: {},
      optionsStatsLoaded: true,
      optionsStatsFetchFailed: false,
    })),
    useCustomFieldsQuery: jest.fn(),
    useSectionTitleQuery: jest.fn(() => ({
      sectionTitle: { value: 'Title' },
      isLoadingSectionTitle: false,
      isSectionTitleError: false,
    })),
    useLoadingErrorCallout: jest.fn(() => ({
      calloutRef: {},
      showErrorNotification: jest.fn(),
    })),
    makeRequest: jest.fn(),
    getConfigName: jest.fn(() => 'cfg'),
    getDisplayInAccordionOptions: jest.fn(() => []),
  };
});

const mockStore = createStore(() => ({
  okapi: {
    tenant: 'test-tenant',
    url: 'https://test.okapi.url',
  },
}));

const renderEditCustomFieldsSettings = (props = {}) => {
  return render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <EditCustomFieldsSettings
          backendModuleName="testModule"
          entityType="user"
          viewRoute="/viewRoute"
          permissions={{
            canEdit: true,
            canDelete: true,
            canView: true,
          }}
          {...props}
        />
      </MemoryRouter>
    </Provider>
  );
};

describe('EditCustomFieldsSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when custom fields are still fetching', () => {
    it('should call useOptionsStatsFetch with null', () => {
      useCustomFieldsQuery.mockReturnValue({
        customFields: [{ id: 'cf-1', name: 'field1' }],
        isFetchingCustomFields: true,
        isCustomFieldsError: false,
        refetchCustomFields: jest.fn(),
      });

      renderEditCustomFieldsSettings();

      expect(useOptionsStatsFetch).toHaveBeenCalled();
      expect(useOptionsStatsFetch.mock.calls[0][2]).toBeNull();
    });
  });

  describe('with system fields', () => {
    const mockSystemFields = ['system-field-1', 'system-field-2'];
    const mockCustomFields = [
      {
        id: 'cf-1',
        name: 'field1',
        refId: 'field1-ref',
        visible: true,
        required: false,
        type: 'TEXT_FIELD',
      },
      {
        id: 'cf-2',
        name: 'system-field-1',
        refId: 'system-field-1',
        visible: true,
        required: false,
        type: 'TEXT_FIELD',
      },
      {
        id: 'cf-3',
        name: 'field2',
        refId: 'field2-ref',
        visible: true,
        required: false,
        type: 'TEXT_FIELD',
      },
      {
        id: 'cf-4',
        name: 'system-field-2',
        refId: 'system-field-2',
        visible: true,
        required: false,
        type: 'TEXT_FIELD',
      },
    ];

    it('should render form when systemFields prop is provided', () => {
      useCustomFieldsQuery.mockReturnValue({
        customFields: mockCustomFields,
        isFetchingCustomFields: false,
        isCustomFieldsError: false,
        refetchCustomFields: jest.fn(),
      });

      renderEditCustomFieldsSettings({
        systemFields: mockSystemFields,
      });

      expect(useOptionsStatsFetch).toHaveBeenCalled();
    });

    it('should pass latestCustomFields to useOptionsStatsFetch when fields are loaded', () => {
      useCustomFieldsQuery.mockReturnValue({
        customFields: mockCustomFields,
        isFetchingCustomFields: false,
        isCustomFieldsError: false,
        refetchCustomFields: jest.fn(),
      });

      renderEditCustomFieldsSettings({
        systemFields: mockSystemFields,
      });

      expect(useOptionsStatsFetch).toHaveBeenCalled();
      expect(useOptionsStatsFetch.mock.calls[0][2]).toEqual(mockCustomFields);
    });

    it('should handle render when no systemFields are provided', () => {
      useCustomFieldsQuery.mockReturnValue({
        customFields: mockCustomFields,
        isFetchingCustomFields: false,
        isCustomFieldsError: false,
        refetchCustomFields: jest.fn(),
      });

      renderEditCustomFieldsSettings({
        systemFields: [],
      });

      expect(useOptionsStatsFetch).toHaveBeenCalled();
    });
  });
});

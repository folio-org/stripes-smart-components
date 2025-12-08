import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';

import { render } from '@folio/jest-config-stripes/testing-library/react';

import EditCustomFieldsSettings from './EditCustomFieldsSettings';
import { useOptionsStatsFetch, useCustomFieldsQuery } from '../../utils';

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
});

import { IntlProvider } from 'react-intl';

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { useCustomFieldsQuery } from '../../utils';
import ViewCustomFieldsRecord from './ViewCustomFieldsRecord';

// The global jest setup mocks react-intl so that `formatDate` returns its
// input unchanged. Restore the real module here so we can exercise actual
// `IntlProvider` timezone handling.
jest.mock('react-intl', () => jest.requireActual('react-intl'));

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  useCustomFieldsQuery: jest.fn(),
  useSectionTitleQuery: jest.fn(() => ({
    sectionTitle: { value: 'Title' },
    isLoadingSectionTitle: false,
    isSectionTitleError: false,
  })),
  useLoadingErrorCallout: jest.fn(() => ({
    calloutRef: { current: null },
  })),
}));

const dateField = {
  id: '1',
  refId: 'date1',
  name: 'Date',
  type: 'DATE_PICKER',
  entityType: 'user',
  visible: true,
};

const renderWithTimeZone = (timeZone) => render(
  <IntlProvider locale="en-US" timeZone={timeZone}>
    <ViewCustomFieldsRecord
      accordionId="acc"
      backendModuleName="users-test"
      entityType="user"
      customFieldsValues={{ date1: '2026-01-01' }}
      expanded
      onToggle={() => {}}
      showAccordion={false}
    />
  </IntlProvider>
);

describe('ViewCustomFieldsRecord - DATE_PICKER timezone handling (STSMACOM-950)', () => {
  beforeEach(() => {
    useCustomFieldsQuery.mockReturnValue({
      customFields: [dateField],
      isLoadingCustomFields: false,
      isCustomFieldsError: false,
    });
  });

  // Without the fix, an ISO date string is parsed as UTC midnight and then
  // formatted in the provider's timezone, which rolls the displayed day back
  // by one in any zone west of UTC.
  it.each(['UTC', 'America/Los_Angeles', 'Asia/Tokyo'])(
    'renders the saved day unchanged when IntlProvider timeZone is %s',
    (timeZone) => {
      renderWithTimeZone(timeZone);

      expect(screen.getByText('1/1/2026')).toBeInTheDocument();
    },
  );
});

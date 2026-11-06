import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import useLookupRecord from '../../utils/useLookupRecord';
import LookupLabel from './LookupLabel';

jest.mock('../../utils/useLookupRecord', () => jest.fn());
// The global stub renders NoValue as an empty span.
jest.mock('@folio/stripes-components', () => jest.requireActual('@folio/stripes-components'));

const id = 'f0c5e5d2-0000-4000-8000-000000000001';
const loadFailedId = 'stripes-smart-components.customFields.lookup.loadFailed';

const recordState = (state = {}) => ({
  label: null,
  isLoadingRecord: false,
  messageId: null,
  viewPath: `/organizations/view/${id}`,
  cacheRecord: jest.fn(),
  ...state,
});

const renderLookupLabel = (props = {}) => render(
  <MemoryRouter>
    <LookupLabel
      refEntityType="organization"
      id={id}
      {...props}
    />
  </MemoryRouter>,
);

describe('LookupLabel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the resolved label as text', () => {
    useLookupRecord.mockReturnValue(recordState({ label: 'Amazon.com' }));

    renderLookupLabel();

    expect(screen.getByText('Amazon.com')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should link the label to the record when asked to', () => {
    useLookupRecord.mockReturnValue(recordState({ label: 'Amazon.com' }));

    renderLookupLabel({ asLink: true });

    expect(screen.getByRole('link', { name: 'Amazon.com' })).toHaveAttribute('href', `/organizations/view/${id}`);
  });

  it('should render the message the hook reports instead of a label', () => {
    useLookupRecord.mockReturnValue(recordState({ messageId: loadFailedId }));

    renderLookupLabel();

    expect(screen.getByText(loadFailedId)).toBeInTheDocument();
  });

  it('should render a placeholder without an id', () => {
    useLookupRecord.mockReturnValue(recordState());

    renderLookupLabel({ id: undefined });

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import LookupSection from './LookupSection';

// The global stub renders NoValue as an empty span.
jest.mock('@folio/stripes-components', () => jest.requireActual('@folio/stripes-components'));

const renderLookupSection = (props = {}) => render(
  <LookupSection
    name="Vendor"
    helpText="Pick the vendor"
    required={false}
    visible
    lookupField={{ refEntityType: 'organization' }}
    {...props}
  />,
);

describe('LookupSection', () => {
  it('should show the label of the configured source', () => {
    renderLookupSection();

    expect(screen.getByText('stripes-smart-components.customFields.lookup.refEntityType.organization')).toBeInTheDocument();
  });

  it('should show a placeholder for a source without an adapter', () => {
    renderLookupSection({ lookupField: { refEntityType: 'holdings' } });

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});

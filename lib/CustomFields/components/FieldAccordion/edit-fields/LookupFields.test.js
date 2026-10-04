import { Form } from 'react-final-form';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import LookupFields from './LookupFields';

// The global setup replaces Select with a stub that drops `disabled` and does not
// provide Layout at all, so the real components are needed to assert the locked state.
jest.mock('@folio/stripes-components', () => jest.requireActual('@folio/stripes-components'));

const lockedMessageId = 'stripes-smart-components.customFields.lookup.refEntityType.locked';

const renderLookupFields = (props = {}) => render(
  <Form
    onSubmit={jest.fn()}
    render={() => (
      <LookupFields
        fieldNamePrefix="customFields[0].values"
        {...props}
      />
    )}
  />,
);

describe('LookupFields', () => {
  it('should keep the lookup source editable by default', () => {
    renderLookupFields();

    expect(screen.getByRole('combobox')).toBeEnabled();
    expect(screen.queryByText(lockedMessageId)).not.toBeInTheDocument();
  });

  it('should disable the lookup source and explain why when the field is in use', () => {
    renderLookupFields({ isRefEntityTypeLocked: true, isRefEntityTypeInUse: true });

    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByText(lockedMessageId)).toBeInTheDocument();
  });

  it('should disable the lookup source without claiming usage while that is unknown', () => {
    renderLookupFields({ isRefEntityTypeLocked: true });

    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.queryByText(lockedMessageId)).not.toBeInTheDocument();
  });
});

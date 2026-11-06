import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { Pluggable } from '@folio/stripes-core';

import useLookupRecord from '../../utils/useLookupRecord';
import LookupField from './LookupField';

jest.mock('../../utils/useLookupRecord', () => jest.fn());
// The global stub reduces TextField to a bare input; the real one is needed for label and end control.
jest.mock('@folio/stripes-components', () => jest.requireActual('@folio/stripes-components'));

const id = 'f0c5e5d2-0000-4000-8000-000000000001';
const organization = { id, name: 'Amazon.com' };
const clearLabel = 'stripes-smart-components.customFields.lookup.clear';
const noPermissionId = 'stripes-smart-components.customFields.lookup.noPermission';

const recordState = (state = {}) => ({
  label: null,
  isLoadingRecord: false,
  messageId: null,
  viewPath: null,
  cacheRecord: jest.fn(),
  ...state,
});

const renderLookupField = (props = {}) => {
  const input = {
    name: 'customFields.vendor',
    value: '',
    onChange: jest.fn(),
    ...props.input,
  };

  render(
    <LookupField
      label="Vendor"
      refEntityType="organization"
      {...props}
      input={input}
    />,
  );

  return { input };
};

describe('LookupField', () => {
  beforeEach(() => {
    // The global stub renders only the fallback. Stand in for the organization plugin
    // and hand a picked record to whichever select callback the field passed in.
    Pluggable.mockImplementation(({ selectVendor, searchLabel }) => (
      <button type="button" onClick={() => selectVendor([organization])}>{searchLabel}</button>
    ));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show the resolved name in a read-only box', () => {
    useLookupRecord.mockReturnValue(recordState({ label: 'Amazon.com' }));

    renderLookupField({ input: { value: id } });

    expect(screen.getByRole('textbox', { name: 'Vendor' })).toHaveValue('Amazon.com');
    expect(screen.getByRole('textbox', { name: 'Vendor' })).toBeDisabled();
  });

  it('should show the message the hook reports inside the box', () => {
    useLookupRecord.mockReturnValue(recordState({ messageId: noPermissionId }));

    renderLookupField({ input: { value: id } });

    expect(screen.getByRole('textbox', { name: 'Vendor' })).toHaveValue(noPermissionId);
  });

  it('should keep the box empty while the record is loading', () => {
    useLookupRecord.mockReturnValue(recordState({ isLoadingRecord: true }));

    renderLookupField({ input: { value: id } });

    expect(screen.getByRole('textbox', { name: 'Vendor' })).toHaveValue('');
  });

  it('should store the id of the picked record and cache the record itself', async () => {
    const state = recordState();

    useLookupRecord.mockReturnValue(state);

    const { input } = renderLookupField();

    await userEvent.click(screen.getByRole('button', { name: 'stripes-smart-components.customFields.lookup.search.organization' }));

    expect(state.cacheRecord).toHaveBeenCalledWith(organization);
    expect(input.onChange).toHaveBeenCalledWith(id);
  });

  it('should remove the value entirely when cleared', async () => {
    useLookupRecord.mockReturnValue(recordState({ label: 'Amazon.com' }));

    const { input } = renderLookupField({ input: { value: id } });

    await userEvent.click(screen.getByRole('button', { name: clearLabel }));

    expect(input.onChange).toHaveBeenCalledWith(undefined);
  });

  it('should offer neither clear nor plugin when disabled', () => {
    useLookupRecord.mockReturnValue(recordState({ label: 'Amazon.com' }));

    renderLookupField({ input: { value: id }, disabled: true });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should explain an unknown source instead of rendering the box', () => {
    const messageId = 'stripes-smart-components.customFields.lookup.unknownRefEntityType';

    useLookupRecord.mockReturnValue(recordState({ messageId }));

    renderLookupField({ refEntityType: 'holdings' });

    expect(screen.getByText(messageId)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});

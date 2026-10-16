import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { register } from '@folio/stripes-core';

import LinkedUser from './LinkedUser';

const mockHasPerm = jest.fn();

jest.mock('stripes-config', () => (
  {
    modules: [],
    metadata: {},
  }
),
  { virtual: true });

jest.mock('@folio/stripes-core', () => ({
  ...jest.requireActual('@folio/stripes-core'),
  useStripes: () => ({ hasPerm: mockHasPerm }),
}));

const userRecord = {
  id: 'id',
  username: 'username',
  personal: {
    firstName: 'first',
    lastName: 'last',
    middleName: 'middle',
  }
};

describe('useLinkedUser', () => {
  beforeEach(() => {
    mockHasPerm.mockReturnValue(true);
    register({ type: 'user', link: '/users/preview/:id' });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('returns a link when permission is present and a link is registered', () => {
    mockHasPerm.mockReturnValue(true);

    const { container } = render(<LinkedUser user={userRecord} />);
    expect(container.querySelector('a')).not.toBeNull();
    screen.getByText(userRecord.personal.firstName, { exact: false });
  });

  it('returns plain text when permission is absent', () => {
    mockHasPerm.mockReturnValue(false);

    const { container } = render(<LinkedUser user={userRecord} />);
    expect(container.querySelector('a')).toBeNull();
    screen.getByText(userRecord.personal.firstName, { exact: false });
  });

  it('returns null when no link is registered for type "user"', () => {
    register({ type: 'user', link: undefined });

    render(<LinkedUser user={userRecord} />);
    expect(screen.getByText(userRecord.username)).not.toBeNull();
  });

  it('uses provided formatter', () => {
    mockHasPerm.mockReturnValue(true);
    const formatter = (u) => u.username;

    const { container } = render(<LinkedUser user={userRecord} formatter={formatter} />);
    expect(container.querySelector('a')).not.toBeNull();
    screen.getByText(userRecord.username);
  });
});

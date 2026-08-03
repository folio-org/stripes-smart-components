import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import EmptyNotice from './EmptyNotice';

describe('EmptyNotice', () => {
  it('should render with text string', () => {
    const text = 'No addresses found';

    render(<EmptyNotice text={text} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('should render with node as text', () => {
    const text = <span data-testid="custom-text">Custom message</span>;

    render(<EmptyNotice text={text} />);

    expect(screen.getByTestId('custom-text')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('should render formatted message node', () => {
    const FormattedMessageMock = () => <span>Formatted message</span>;

    render(<EmptyNotice text={<FormattedMessageMock />} />);

    expect(screen.getByText('Formatted message')).toBeInTheDocument();
  });
});

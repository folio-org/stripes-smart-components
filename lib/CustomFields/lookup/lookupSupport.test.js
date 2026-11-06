import { isLookupTypeSupported } from './lookupSupport';

describe('isLookupTypeSupported', () => {
  it.each([
    ['3.2', true],
    ['3.10', true],
    ['3.1', false],
    ['2.9', false],
    ['4.0', false],
  ])('should report custom-fields %s as %s', (version, expected) => {
    expect(isLookupTypeSupported(version)).toBe(expected);
  });

  it('should treat a missing version as unsupported', () => {
    expect(isLookupTypeSupported(undefined)).toBe(false);
    expect(isLookupTypeSupported(null)).toBe(false);
  });
});

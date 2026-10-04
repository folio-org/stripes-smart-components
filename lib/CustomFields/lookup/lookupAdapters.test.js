import {
  LOOKUP_REF_ENTITY_TYPES,
  getLookupAdapter,
  getLookupRefEntityTypeOptions,
  lookupAdapters,
  unwrapSelectedRecord,
} from './lookupAdapters';

const id = 'f0c5e5d2-0000-4000-8000-000000000001';

describe('lookupAdapters', () => {
  it('should provide an adapter for every declared source', () => {
    Object.values(LOOKUP_REF_ENTITY_TYPES).forEach((refEntityType) => {
      expect(getLookupAdapter(refEntityType)).toBe(lookupAdapters[refEntityType]);
    });
  });

  it('should return null for a source without an adapter', () => {
    expect(getLookupAdapter('holdings')).toBeNull();
    expect(getLookupAdapter(undefined)).toBeNull();
  });

  it('should build the record path and view route from the id', () => {
    const { resolvePath, viewPath } = lookupAdapters[LOOKUP_REF_ENTITY_TYPES.INSTANCE];

    expect(resolvePath(id)).toBe(`inventory/instances/${id}`);
    expect(viewPath(id)).toBe(`/inventory/view/${id}`);
  });

  describe('labels', () => {
    it('should use the organization name', () => {
      expect(lookupAdapters.organization.toLabel({ name: 'Amazon.com' })).toBe('Amazon.com');
    });

    it('should use the instance title', () => {
      expect(lookupAdapters.instance.toLabel({ title: 'A title' })).toBe('A title');
    });

    it('should name a user as "last, first"', () => {
      expect(lookupAdapters.user.toLabel({ personal: { firstName: 'Luke', lastName: 'Skywalker' } })).toBe('Skywalker, Luke');
    });

    it('should fall back to the username and then the id for a user without a name', () => {
      expect(lookupAdapters.user.toLabel({ id, username: 'luke' })).toBe('luke');
      expect(lookupAdapters.user.toLabel({ id })).toBe(id);
    });
  });

  it('should unwrap a record a plugin passes as a single-element array', () => {
    const record = { id };

    expect(unwrapSelectedRecord([record])).toBe(record);
    expect(unwrapSelectedRecord(record)).toBe(record);
  });

  it('should list every source as a select option', () => {
    const formatMessage = jest.fn(({ id: messageId }) => messageId);

    expect(getLookupRefEntityTypeOptions(formatMessage)).toEqual(
      Object.entries(lookupAdapters).map(([value, adapter]) => ({ value, label: adapter.labelId })),
    );
  });
});

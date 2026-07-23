import { CUSTOM_FIELDS_SYSTEM_REF_IDS } from '../constants';
import excludeSystemCustomFields from './excludeSystemCustomFields';

describe('excludeSystemCustomFields', () => {
  it('should return all custom fields when no system fields are provided', () => {
    const customFields = [
      { name: 'Department', refId: 'department' },
      { name: 'Location', refId: 'location' },
    ];
    const result = excludeSystemCustomFields([], customFields);

    expect(result).toEqual(customFields);
  });

  it('should exclude system fields from custom fields', () => {
    const customFields = [
      { name: 'Department', refId: 'department' },
      { name: 'System Field', refId: CUSTOM_FIELDS_SYSTEM_REF_IDS[0] },
    ];
    const result = excludeSystemCustomFields([], customFields);

    expect(result).toHaveLength(1);
    expect(result[0].refId).toBe('department');
  });

  it('should exclude custom system fields provided in systemFields parameter', () => {
    const customFields = [
      { name: 'Department', refId: 'department' },
      { name: 'Custom System', refId: 'customSystem' },
    ];

    const result = excludeSystemCustomFields(['customSystem'], customFields);
    expect(result).toHaveLength(1);
    expect(result[0].refId).toBe('department');
  });

  it('should handle fields without refId', () => {
    const customFields = [
      { name: 'Department' },
      { name: 'Location', refId: 'location' },
    ];
    const result = excludeSystemCustomFields([], customFields);

    expect(result).toHaveLength(2);
  });

  it('should exclude both predefined and custom system fields', () => {
    const customFields = [
      { name: 'Department', refId: 'department' },
      { name: 'System 1', refId: CUSTOM_FIELDS_SYSTEM_REF_IDS[0] },
      { name: 'System 2', refId: 'customSystem' },
    ];
    const result = excludeSystemCustomFields(['customSystem'], customFields);

    expect(result).toHaveLength(1);
    expect(result[0].refId).toBe('department');
  });

  it('should return empty array when all fields are system fields', () => {
    const customFields = [
      { name: 'System 1', refId: CUSTOM_FIELDS_SYSTEM_REF_IDS[0] },
    ];
    const result = excludeSystemCustomFields([], customFields);

    expect(result).toHaveLength(0);
  });
});

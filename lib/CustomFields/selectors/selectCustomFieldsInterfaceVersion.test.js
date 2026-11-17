import selectCustomFieldsInterfaceVersion from './selectCustomFieldsInterfaceVersion';

const moduleId = 'mod-orders-storage-14.0.0';

const state = {
  discovery: {
    interfaceProviders: [
      {
        id: 'mod-users-19.4.0',
        provides: [{ id: 'custom-fields', version: '3.1' }],
      },
      {
        id: moduleId,
        provides: [
          { id: 'orders-storage.purchase-orders', version: '8.0' },
          { id: 'custom-fields', version: '3.2' },
        ],
      },
    ],
  },
};

describe('selectCustomFieldsInterfaceVersion', () => {
  it('should return the custom-fields version the given module provides', () => {
    expect(selectCustomFieldsInterfaceVersion(state, moduleId)).toBe('3.2');
  });

  it('should return null for a module that is not in the discovery data', () => {
    expect(selectCustomFieldsInterfaceVersion(state, 'mod-unknown-1.0.0')).toBeNull();
  });

  it('should return null before discovery has run', () => {
    expect(selectCustomFieldsInterfaceVersion({}, moduleId)).toBeNull();
    expect(selectCustomFieldsInterfaceVersion({ discovery: {} }, moduleId)).toBeNull();
  });
});

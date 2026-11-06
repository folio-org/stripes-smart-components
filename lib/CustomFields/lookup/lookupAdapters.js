export const LOOKUP_REF_ENTITY_TYPES = {
  ORGANIZATION: 'organization',
  USER: 'user',
  INSTANCE: 'instance',
};

const getUserLabel = (user) => {
  const { firstName, lastName } = user?.personal || {};
  const fullName = [lastName, firstName].filter(Boolean).join(', ');

  return fullName || user?.username || user?.id;
};

// API paths are duplicated rather than imported from stripes-acq-components:
// that package already depends on this one, so importing it back would be a cycle.
const ORGANIZATIONS_API = 'organizations/organizations';
const USERS_API = 'users';
const INSTANCES_API = 'inventory/instances';

// Finder plugins share no common interface, hence one adapter each. The backend takes
// any non-blank `refEntityType`, so a new lookup target is an entry here, not a schema
// change.
export const lookupAdapters = {
  [LOOKUP_REF_ENTITY_TYPES.ORGANIZATION]: {
    pluginType: 'find-organization',
    selectProp: 'selectVendor',
    labelId: 'stripes-smart-components.customFields.lookup.refEntityType.organization',
    searchLabelId: 'stripes-smart-components.customFields.lookup.search.organization',
    resolvePath: id => `${ORGANIZATIONS_API}/${id}`,
    toLabel: record => record?.name,
    viewPath: id => `/organizations/view/${id}`,
  },
  [LOOKUP_REF_ENTITY_TYPES.USER]: {
    pluginType: 'find-user',
    selectProp: 'selectUser',
    labelId: 'stripes-smart-components.customFields.lookup.refEntityType.user',
    searchLabelId: 'stripes-smart-components.customFields.lookup.search.user',
    resolvePath: id => `${USERS_API}/${id}`,
    toLabel: getUserLabel,
    viewPath: id => `/users/view/${id}`,
  },
  [LOOKUP_REF_ENTITY_TYPES.INSTANCE]: {
    pluginType: 'find-instance',
    selectProp: 'selectInstance',
    labelId: 'stripes-smart-components.customFields.lookup.refEntityType.instance',
    searchLabelId: 'stripes-smart-components.customFields.lookup.search.instance',
    resolvePath: id => `${INSTANCES_API}/${id}`,
    toLabel: record => record?.title,
    viewPath: id => `/inventory/view/${id}`,
  },
};

export const getLookupAdapter = refEntityType => lookupAdapters[refEntityType] || null;

// Some plugins pass the picked record through as an array even for single select.
export const unwrapSelectedRecord = selection => (Array.isArray(selection) ? selection[0] : selection);

export const getLookupRefEntityTypeOptions = formatMessage => Object.entries(lookupAdapters)
  .map(([refEntityType, adapter]) => ({
    value: refEntityType,
    label: formatMessage({ id: adapter.labelId }),
  }));

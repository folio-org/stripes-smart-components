// The first `custom-fields` interface whose implementation accepts the LOOKUP type.
export const LOOKUP_CUSTOM_FIELDS_INTERFACE_VERSION = '3.2';

const parseVersion = version => String(version).split('.').map(part => parseInt(part, 10));

/**
 * Whether a module providing the given `custom-fields` interface version accepts
 * LOOKUP field definitions. Interface versions are compatible within one major
 * version, so the minor version only has to be high enough.
 */
export const isLookupTypeSupported = (interfaceVersion) => {
  if (!interfaceVersion) return false;

  const [gotMajor, gotMinor = 0] = parseVersion(interfaceVersion);
  const [wantedMajor, wantedMinor] = parseVersion(LOOKUP_CUSTOM_FIELDS_INTERFACE_VERSION);

  return gotMajor === wantedMajor && gotMinor >= wantedMinor;
};

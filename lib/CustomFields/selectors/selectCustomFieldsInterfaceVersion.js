/**
 * Returns the `custom-fields` interface version the given backend module provides.
 *
 * `stripes.hasInterface` cannot answer this: `custom-fields` is an
 * `interfaceType: multiple` interface, and discovery keeps only one version per
 * interface name there. `interfaceProviders` lists them per module.
 */
const selectCustomFieldsInterfaceVersion = (store, backendModuleId) => {
  const provider = store?.discovery?.interfaceProviders?.find(({ id }) => id === backendModuleId);
  const customFieldsInterface = provider?.provides.find(({ id }) => id === 'custom-fields');

  return customFieldsInterface?.version ?? null;
};

export default selectCustomFieldsInterfaceVersion;

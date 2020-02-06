export default (store, moduleName) => {
  const { modules } = store.discovery;
  if (!modules) return null;

  const moduleIds = Object.keys(modules);

  return moduleIds.find(id => modules[id] === moduleName);
};

const selectModuleId = (store, moduleName) => {
  const modules = store?.discovery?.modules;

  if (!modules) return null;

  const moduleIds = Object.keys(modules);

  return moduleIds.find(id => modules[id] === moduleName);
};

export default selectModuleId;

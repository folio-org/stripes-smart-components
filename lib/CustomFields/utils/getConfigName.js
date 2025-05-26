const getConfigName = (configNamePrefix) => {
  return [configNamePrefix, 'custom_fields_label'].filter(Boolean).join('_');
};

export default getConfigName;

import { CUSTOM_FIELDS_SYSTEM_REF_IDS } from '../constants';

const excludeSystemCustomFields = (systemFields, customFields) => {
  const fieldsToExclude = new Set([...CUSTOM_FIELDS_SYSTEM_REF_IDS, ...systemFields]);

  return customFields.filter((cf) => !fieldsToExclude.has(cf.refId));
};

export default excludeSystemCustomFields;

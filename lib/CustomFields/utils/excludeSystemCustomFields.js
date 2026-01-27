import { CUSTOM_FIELDS_SYSTEM_REF_IDS } from '../constants';

export const getSystemCustomFieldsSet = (systemFields = []) => {
  return new Set([...CUSTOM_FIELDS_SYSTEM_REF_IDS, ...systemFields]);
};

const excludeSystemCustomFields = (systemFields, customFields) => {
  const fieldsToExclude = getSystemCustomFieldsSet(systemFields);

  return customFields.filter((cf) => !fieldsToExclude.has(cf.refId));
};

export default excludeSystemCustomFields;

import { CUSTOM_FIELDS_SECTION_ID } from '../constants';

const getDisplayInAccordionOptions = (sectionTitleValue, displayInAccordionOptions) => {
  return [
    {
      value: CUSTOM_FIELDS_SECTION_ID,
      label: sectionTitleValue,
    },
    ...displayInAccordionOptions,
  ].sort((a, b) => a.label.localeCompare(b.label));
};

export default getDisplayInAccordionOptions;

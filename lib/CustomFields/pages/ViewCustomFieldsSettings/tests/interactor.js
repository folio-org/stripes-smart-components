import {
  interactor,
  text,
  collection,
  triggerable,
  is,
  isPresent,
} from '@bigtest/interactor';

import MultiColumnListInteractor from '@folio/stripes-components/lib/MultiColumnList/tests/interactor';

export default interactor(class ViewCustomFieldsSettings {
  customFields = collection('[data-test-accordion-section', {
    openAccordion: triggerable('[class^="defaultCollapseButton"]'),
    fields: collection('[class^="col-"]', {
      label: text('[class^="kvLabel--"]'),
      value: text('[data-test-kv-value]'),
      options: collection('[class^="mclRow--"]', {
        columns: collection('[class^="mclCell--"]', {
          inputChecked: is('input', ':checked'),
          inputDisabled: is('input', ':disabled'),
        }),
      }),
    }),
  });

  mcl = collection('[data-test-custom-field-options]', MultiColumnListInteractor);

  whenLoaded() {
    return this.when(() => isPresent('#custom-fields-pane'));
  }
});

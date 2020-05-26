import {
  interactor,
  isPresent,
  collection,
} from '@bigtest/interactor';

import DropdownInteractor from '@folio/stripes-components/lib/Dropdown/tests/interactor';
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor';

export default interactor(class AddButtonInteractor {
  dropdown = new DropdownInteractor('[data-test-add-custom-field-dropdown]');
  hasDropdown = isPresent('[data-test-add-custom-field-dropdown]');
  addCustomFieldButtons = collection('[data-test-add-custom-field-button]', ButtonInteractor);

  click = function () {
    return this.dropdown.focusAndOpen();
  };

  selectCustomFieldType = function (index) {
    return this.addCustomFieldButtons(index).click();
  };
});

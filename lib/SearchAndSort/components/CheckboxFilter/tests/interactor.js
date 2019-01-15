import {
  count,
  clickable,
  interactor,
  collection,
  is
} from '@bigtest/interactor';

const DataOption = interactor(class DataOptionInteractor {
  click = clickable();
  isSelected = is('[checked]');
  isDisabled = is('disabled');
  isReadOnly = is('readonly')
});

export default interactor(class CheckboxFilterInteractor {
  dataOptionsCount = count('[data-test-checkbox-filter-data-option]');
  dataOptions = collection('[data-test-checkbox-filter-data-option]', DataOption);
});

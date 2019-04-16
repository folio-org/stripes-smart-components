import {
  clickable,
  interactor,
  attribute,
  fillable,
  text,
  isPresent,
  blurrable,
} from '@bigtest/interactor';

import DATE_TYPES from '../date-types';

const {
  START,
  END,
} = DATE_TYPES;

const startDateInputSelector = `[data-test-date-input="${START}"]`;
const endDateInputSelector = `[data-test-date-input="${END}"]`;

const DateInput = interactor(class DateInputInteractor {
  placeholder = attribute('placeholder');
  fill = fillable();
  blur = blurrable();
  value = text();

  enterDate(date) {
    return this
      .fill(date)
      .blur();
  }
});

const ApplyButton = interactor(class ApplyButtonInteractor {
  click = clickable();
});

export default interactor(class DateRangeFilterInteractor {
  startDateInput = new DateInput(startDateInputSelector);
  endDateInput = new DateInput(endDateInputSelector);

  applyButton = new ApplyButton('[data-test-apply-button]');

  startDateInvalidErrorIsShown = isPresent(`[data-test-invalid-date=${START}]`)
  endDateInvalidErrorIsShown = isPresent(`[data-test-invalid-date=${END}]`)
  startDateMissingErrorDisplayed = isPresent(`[data-test-missing-date=${START}]`)
  endDateMissingErrorDisplayed = isPresent(`[data-test-missing-date=${END}]`)
  wrongOrderDatesErrorIsShown = isPresent('[data-test-wrong-dates-order]')
});

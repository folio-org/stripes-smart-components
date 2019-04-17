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
  startDateInput = new DateInput(`[data-test-date-input="${START}"]`);
  endDateInput = new DateInput(`[data-test-date-input="${END}"]`);

  applyButton = new ApplyButton('[data-test-apply-button]');

  invalidStartDateErrorDisplayed = isPresent(`[data-test-invalid-date=${START}]`)
  invalidEndDateErrorDisplayed = isPresent(`[data-test-invalid-date=${END}]`)
  missingStartDateErrorDisplayed = isPresent(`[data-test-missing-date=${START}]`)
  missingEndDateErrorDisplayed = isPresent(`[data-test-missing-date=${END}]`)
  wrongOrderDatesErrorDisplayed = isPresent('[data-test-wrong-dates-order]')
});

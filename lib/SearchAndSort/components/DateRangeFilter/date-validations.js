import moment from 'moment';
import DATE_TYPES from './date-types';

export const isDateValid = (date, dateFormat) => {
  const momentDateWrapper = moment(date, dateFormat, true);

  return momentDateWrapper.isValid();
};

export const validateDateRange = (dateRange, dateFormat, requiredFields = [DATE_TYPES.START, DATE_TYPES.END]) => {
  const {
    startDate,
    endDate,
  } = dateRange;

  const startDateMomentWrapper = moment(startDate, dateFormat, true);
  const endDateMomentWrapper = moment(endDate, dateFormat, true);

  const startDateEmpty = startDate === '';
  const endDateEmpty = endDate === '';
  const bothDatesEntered = !startDateEmpty && !endDateEmpty;
  let startDateMissing = !bothDatesEntered && !endDateEmpty;
  let endDateMissing = !bothDatesEntered && !startDateEmpty;

  let startDateInvalid = !isDateValid(startDate, dateFormat);
  let endDateInvalid = !isDateValid(endDate, dateFormat);

  let dateRangeValid = false;
  let wrongDatesOrder = false;
  if (bothDatesEntered) {
    const bothDatesValid = !startDateInvalid && !endDateInvalid;
    wrongDatesOrder = bothDatesValid && startDateMomentWrapper.isAfter(endDateMomentWrapper);
    dateRangeValid = bothDatesEntered && bothDatesValid && !wrongDatesOrder;
  } else if (startDateEmpty && endDateEmpty) {
    startDateMissing = requiredFields.includes(DATE_TYPES.START);
    endDateMissing = requiredFields.includes(DATE_TYPES.END);
    startDateInvalid = false;
    endDateInvalid = false;
  } else if (startDateEmpty) {
    startDateMissing = requiredFields.includes(DATE_TYPES.START);
    startDateInvalid = false;
    dateRangeValid = !startDateMissing && !endDateInvalid;
  } else if (endDateEmpty) {
    endDateMissing = requiredFields.includes(DATE_TYPES.END);
    endDateInvalid = false;
    dateRangeValid = !endDateMissing && !startDateInvalid;
  }

  return {
    dateRangeValid,
    errors: {
      startDateInvalid,
      endDateInvalid,
      endDateMissing,
      startDateMissing,
      wrongDatesOrder,
    },
  };
};

import moment from 'moment';

export const isDateValid = (date, dateFormat) => {
  const momentDateWrapper = moment(date, dateFormat, true);

  return momentDateWrapper.isValid();
};

export const validateDateRange = (dateRange, dateFormat) => {
  const {
    startDate,
    endDate,
  } = dateRange;

  const startDateMomentWrapper = moment(startDate, dateFormat, true);
  const endDateMomentWrapper = moment(endDate, dateFormat, true);

  const isStartDateEmpty = startDate === '';
  const isEndDateEmpty = endDate === '';
  const areBothDatesEntered = !isStartDateEmpty && !isEndDateEmpty;
  const startDateMissing = !areBothDatesEntered && !isEndDateEmpty;
  const endDateMissing = !areBothDatesEntered && !isStartDateEmpty;

  const startDateInvalid = !isStartDateEmpty && !isDateValid(startDate, dateFormat);
  const endDateInvalid = !isEndDateEmpty && !isDateValid(endDate, dateFormat);
  const areBothDatesValid = !startDateInvalid && !endDateInvalid;

  const wrongDatesOrder = areBothDatesValid && startDateMomentWrapper.isAfter(endDateMomentWrapper);

  const isDateRangeValid = areBothDatesEntered && areBothDatesValid && !wrongDatesOrder;

  return {
    isDateRangeValid,
    errors: {
      startDateInvalid,
      endDateInvalid,
      endDateMissing,
      startDateMissing,
      wrongDatesOrder,
    },
  };
};

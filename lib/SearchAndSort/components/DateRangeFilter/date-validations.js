import moment from 'moment';

export const isDateValid = (date, dateFormat) => {
  const momentDateWrapper = moment(date, dateFormat, true);
  const isEmpty = date === '';

  return isEmpty || momentDateWrapper.isValid();
};

export const validateDateRange = (dateRange, dateFormat) => {
  const {
    startDate,
    endDate,
  } = dateRange;

  const isStartDateEmpty = startDate === '';
  const isEndDateEmpty = endDate === '';

  const startDateMomentWrapper = moment(startDate, dateFormat, true);
  const endDateMomentWrapper = moment(endDate, dateFormat, true);

  const startDateInvalid = !isDateValid(startDate, dateFormat);
  const endDateInvalid = !isDateValid(endDate, dateFormat);

  const areBothDatesEntered = !isStartDateEmpty && !isEndDateEmpty;
  const startDateMissing = !areBothDatesEntered && !isEndDateEmpty;
  const endDateMissing = !areBothDatesEntered && !isStartDateEmpty;
  const areBothDatesValid = !startDateInvalid && !endDateInvalid;

  const wrongDatesOrder = areBothDatesValid && startDateMomentWrapper.isAfter(endDateMomentWrapper);

  const isDateRangeValid = areBothDatesEntered && areBothDatesValid && !wrongDatesOrder;

  return {
    isDateRangeValid,
    errors: {
      startDateInvalid,
      endDateInvalid,
      wrongDatesOrder,
      endDateMissing,
      startDateMissing,
    },
  };
};

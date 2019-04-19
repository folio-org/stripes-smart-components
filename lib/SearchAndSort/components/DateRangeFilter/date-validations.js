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

  const startDateEmpty = startDate === '';
  const endDateEmpty = endDate === '';
  const bothDatesEntered = !startDateEmpty && !endDateEmpty;
  const startDateMissing = !bothDatesEntered && !endDateEmpty;
  const endDateMissing = !bothDatesEntered && !startDateEmpty;

  const startDateInvalid = !startDateEmpty && !isDateValid(startDate, dateFormat);
  const endDateInvalid = !endDateEmpty && !isDateValid(endDate, dateFormat);
  const bothDatesValid = !startDateInvalid && !endDateInvalid;

  const wrongDatesOrder = bothDatesValid && startDateMomentWrapper.isAfter(endDateMomentWrapper);

  const dateRangeValid = bothDatesEntered && bothDatesValid && !wrongDatesOrder;

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

import { dayjs } from '@folio/stripes-components';

export const isDateValid = (date, dateFormat) => {
  const dayjsDateWrapper = dayjs(date, dateFormat, true);

  return dayjsDateWrapper.isValid();
};

export const validateDateRange = (dateRange, dateFormat) => {
  const {
    startDate,
    endDate,
  } = dateRange;

  const startDateDayJSWrapper = dayjs(startDate, dateFormat, true);
  const endDateDayJSWrapper = dayjs(endDate, dateFormat, true);

  const startDateEmpty = startDate === '';
  const endDateEmpty = endDate === '';
  const bothDatesEntered = !startDateEmpty && !endDateEmpty;
  const startDateMissing = !bothDatesEntered && !endDateEmpty;
  const endDateMissing = !bothDatesEntered && !startDateEmpty;

  const startDateInvalid = !startDateEmpty && !isDateValid(startDate, dateFormat);
  const endDateInvalid = !endDateEmpty && !isDateValid(endDate, dateFormat);
  const bothDatesValid = !startDateInvalid && !endDateInvalid;

  const wrongDatesOrder = bothDatesValid && startDateDayJSWrapper.isAfter(endDateDayJSWrapper);

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

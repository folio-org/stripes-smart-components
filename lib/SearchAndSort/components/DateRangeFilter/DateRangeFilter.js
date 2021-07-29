import React, { memo } from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Button, Datepicker } from '@folio/stripes-components';

import {
  isDateValid,
  validateDateRange,
} from './date-validations';

import DATE_TYPES from './date-types';

import styles from './DateRange.css';

const defaultFilterState = {
  dateRangeValid: false,
  errors: {
    startDateInvalid: false,
    endDateInvalid: false,
    startDateMissing: false,
    endDateMissing: false,
    wrongDatesOrder: false,
  },
};

const renderInvalidDateError = (dateType) => (
  <span data-test-invalid-date={dateType}>
    <FormattedMessage id="stripes-smart-components.dateRange.invalidDate" />
  </span>
);

const renderMissingDateError = (dateType) => {
  const translationId = dateType === DATE_TYPES.START
    ? 'stripes-smart-components.dateRange.missingStartDate'
    : 'stripes-smart-components.dateRange.missingEndDate';

  return (
    <span data-test-missing-date={dateType}>
      <FormattedMessage id={translationId} />
    </span>
  );
};

const renderInvalidOrderError = () => (
  <span
    className={styles.validationMessage}
    data-test-wrong-dates-order
  >
    <FormattedMessage id="stripes-smart-components.dateRange.wrongOrder" />
  </span>
);

const getInitialValidationData = (selectedValues, dateFormat) => {
  const {
    startDate,
    endDate,
  } = selectedValues;

  const dateRangeIsNotEmpty = startDate !== '' || endDate !== '';

  return dateRangeIsNotEmpty
    ? validateDateRange(selectedValues, dateFormat)
    : defaultFilterState;
};

const getDateError = ({ errors, dateInvalid, dateMissing, type }) => {
  return (errors[dateInvalid] && renderInvalidDateError(DATE_TYPES[type]))
    || (errors[dateMissing] && renderMissingDateError(DATE_TYPES[type]));
};

const DateRangeFilter = memo(({
  dateFormat = 'YYYY-MM-DD',
  name,
  selectedValues,
  makeFilterString,
  onChange
}) => {
  const [filterValue, setFilterValue] = React.useState({
    ...defaultFilterState,
    selectedValues
  });

  const { errors, dateRangeValid, selectedValues: selectedValuesState } = filterValue;
  const { startDate, endDate } = selectedValuesState;
  const { wrongDatesOrder } = errors;

  const startDateError = getDateError({
    errors,
    dateInvalid: 'startDateInvalid',
    dateMissing: 'startDateMissing',
    type: 'START'
  });

  const endDateError = getDateError({
    errors,
    dateInvalid: 'endDateInvalid',
    dateMissing: 'endDateMissing',
    type: 'END'
  });

  const onSubmit = (event) => {
    event.preventDefault();

    const bothDatesEmpty = startDate === '' && endDate === '';

    if (!bothDatesEmpty) {
      const validationData = validateDateRange(selectedValuesState, dateFormat);

      setFilterValue(prevState => ({
        ...prevState,
        ...validationData
      }));
    }
  };

  const handleDateChange = (event, field) => {
    const date = event.target.value;
    const dateIsEmpty = date === '';
    const dateIsInvalid = !dateIsEmpty && !isDateValid(date, dateFormat);
    const errorName = `${field}Invalid`;

    const newSelectedValues = {
      ...selectedValuesState,
      [field]: date
    };

    setFilterValue({
      ...defaultFilterState,
      errors: {
        ...defaultFilterState.errors, // reset filter errors on every change
        [errorName]: dateIsInvalid
      },
      selectedValues: newSelectedValues
    });
  };

  const applyFilter = () => {
    const filterString = makeFilterString(startDate, endDate);

    onChange({
      name,
      values: [filterString]
    });
  };

  React.useEffect(() => {
    if (dateRangeValid) {
      applyFilter();
    }
  }, [dateRangeValid]);

  React.useEffect(() => {
    setFilterValue({
      ...getInitialValidationData(selectedValues, dateFormat),
      selectedValues
    });
  }, [selectedValues, dateFormat]);

  return (
    <form onSubmit={onSubmit}>
      <Datepicker
        name={DATE_TYPES.START}
        label={<FormattedMessage id="stripes-smart-components.dateRange.from" />}
        value={selectedValuesState.startDate}
        dateFormat={dateFormat}
        error={startDateError || undefined}
        data-test-date-input={DATE_TYPES.START}
        onChange={e => handleDateChange(e, 'startDate')}
      />
      <Datepicker
        name={DATE_TYPES.END}
        label={<FormattedMessage id="stripes-smart-components.dateRange.to" />}
        value={selectedValuesState.endDate}
        dateFormat={dateFormat}
        error={endDateError || undefined}
        data-test-date-input={DATE_TYPES.END}
        onChange={e => handleDateChange(e, 'endDate')}
      />
      {wrongDatesOrder && renderInvalidOrderError()}
      <Button
        data-test-apply-button
        marginBottom0
        type="submit"
      >
        <FormattedMessage id="stripes-smart-components.dateRange.apply" />
      </Button>
    </form>
  );
});

DateRangeFilter.propTypes = {
  dateFormat: PropTypes.string,
  makeFilterString: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  selectedValues: PropTypes.shape({
    endDate: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
  }).isRequired,
};

export default DateRangeFilter;

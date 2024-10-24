import React, { memo } from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Button, Datepicker, AVAILABLE_PLACEMENTS } from '@folio/stripes-components';

import { useSetRef, useSetRefOnFocus } from '../../../utils';
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

const renderInvalidDateError = (dateType, dateFormat) => {
  if (dateFormat === 'YYYY') {
    return <FormattedMessage id="stripes-smart-components.dateRange.invalidYear" />;
  }

  return (
    <span data-test-invalid-date={dateType}>
      <FormattedMessage id="stripes-smart-components.dateRange.invalidDate" />
    </span>
  );
};

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

const InvalidOrderError = () => (
  <span
    className={styles.validationMessage}
    data-test-wrong-dates-order
  >
    <FormattedMessage id="stripes-smart-components.dateRange.wrongOrder" />
  </span>
);

const getInitialValidationData = (selectedValues, dateFormat, requiredFields, ignoreDatesOrder) => {
  const {
    startDate,
    endDate,
  } = selectedValues;

  const dateRangeIsNotEmpty = startDate !== '' || endDate !== '';

  return dateRangeIsNotEmpty
    ? validateDateRange(selectedValues, dateFormat, requiredFields, ignoreDatesOrder)
    : defaultFilterState;
};

const getDateError = ({ errors, dateFormat, dateInvalid, dateMissing, type }) => {
  return (errors[dateInvalid] && renderInvalidDateError(DATE_TYPES[type], dateFormat))
    || (errors[dateMissing] && renderMissingDateError(DATE_TYPES[type]));
};

const arePropsEqual = (prev, next) => {
  return (
    (prev.onChange === next.onChange) &&
    (JSON.stringify(prev.selectedValues) === JSON.stringify(next.selectedValues))
  );
};

const DEFAULT_REQUIRED_FIELDS = [DATE_TYPES.START, DATE_TYPES.END];

const TheComponent = ({
  dateFormat = 'YYYY-MM-DD',
  placement = 'right-start',
  name,
  selectedValues,
  makeFilterString,
  onChange,
  focusRef,
  requiredFields = DEFAULT_REQUIRED_FIELDS,
  // accessible label for disambiguating this start input from others.
  startLabel,
  // accessible label for disambiguating this end input from others.
  endLabel,
  hideCalendarButton = false,
  endDateInputRef,
  ignoreDatesOrder = false,
}) => {
  const [filterValue, setFilterValue] = React.useState({
    ...defaultFilterState,
    selectedValues
  });

  const setFocusRef = useSetRef(focusRef);
  const setFocusRefOnFocus = useSetRefOnFocus(focusRef);
  const setEndDateInputRef = useSetRef(endDateInputRef);

  const { errors, selectedValues: selectedValuesState } = filterValue;
  const { startDate, endDate } = selectedValuesState;
  const { wrongDatesOrder } = errors;

  const startDateError = getDateError({
    errors,
    dateFormat,
    dateInvalid: 'startDateInvalid',
    dateMissing: 'startDateMissing',
    type: 'START'
  });

  const endDateError = getDateError({
    errors,
    dateFormat,
    dateInvalid: 'endDateInvalid',
    dateMissing: 'endDateMissing',
    type: 'END'
  });

  const applyFilter = React.useCallback(() => {
    const filterString = makeFilterString(startDate, endDate);

    onChange({
      name,
      values: [filterString]
    });
  }, [startDate, endDate, onChange, makeFilterString, name]);

  const onApply = React.useCallback((event) => {
    if (event) event.preventDefault();

    const bothDatesEmpty = startDate === '' && endDate === '';

    if (!bothDatesEmpty) {
      const validationData = validateDateRange(selectedValuesState, dateFormat, requiredFields, ignoreDatesOrder);

      setFilterValue(prevState => ({
        ...prevState,
        ...validationData
      }));

      if (validationData.dateRangeValid) applyFilter();
    }
  }, [applyFilter, dateFormat, endDate, selectedValuesState, startDate, requiredFields, ignoreDatesOrder]);

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
      ...filterValue,
      errors: {
        ...filterValue.errors,
        [errorName]: dateIsInvalid
      },
      selectedValues: newSelectedValues
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onApply();
    }
  };

  React.useEffect(() => {
    setFilterValue({
      ...getInitialValidationData(selectedValues, dateFormat, requiredFields, ignoreDatesOrder),
      selectedValues
    });
  }, [selectedValues, dateFormat, requiredFields, ignoreDatesOrder]);

  return (
    <>
      <Datepicker
        name={DATE_TYPES.START}
        label={<FormattedMessage id="stripes-smart-components.dateRange.from" />}
        value={selectedValuesState.startDate}
        dateFormat={dateFormat}
        error={startDateError || undefined}
        data-test-date-input={DATE_TYPES.START}
        onChange={e => handleDateChange(e, 'startDate')}
        onKeyDown={handleKeyDown}
        placement={placement}
        usePortal
        inputRef={element => {
          setFocusRef(element);
          setFocusRefOnFocus(element);
        }}
        aria-label={startLabel}
        hideCalendarButton={hideCalendarButton}
      />
      <Datepicker
        name={DATE_TYPES.END}
        label={<FormattedMessage id="stripes-smart-components.dateRange.to" />}
        value={selectedValuesState.endDate}
        dateFormat={dateFormat}
        error={endDateError || undefined}
        data-test-date-input={DATE_TYPES.END}
        onChange={e => handleDateChange(e, 'endDate')}
        onKeyDown={handleKeyDown}
        placement={placement}
        usePortal
        inputRef={element => {
          setFocusRef(element);
          setEndDateInputRef(element);
        }}
        aria-label={endLabel}
        hideCalendarButton={hideCalendarButton}
      />
      <div role="alert">
        {wrongDatesOrder && <InvalidOrderError />}
      </div>
      <Button
        data-test-apply-button
        marginBottom0
        onClick={onApply}
      >
        <FormattedMessage id="stripes-smart-components.dateRange.apply" />
      </Button>
    </>
  );
};

TheComponent.propTypes = {
  dateFormat: PropTypes.string,
  endLabel: PropTypes.string,
  focusRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  hideCalendarButton: PropTypes.bool,
  ignoreDatesOrder: PropTypes.bool,
  makeFilterString: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placement: PropTypes.oneOf(AVAILABLE_PLACEMENTS),
  selectedValues: PropTypes.shape({
    endDate: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
  }).isRequired,
  startLabel: PropTypes.string,
  requiredFields: PropTypes.arrayOf(PropTypes.oneOf([DATE_TYPES.START, DATE_TYPES.END])),
  endDateInputRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

const DateRangeFilter = memo(TheComponent, arePropsEqual);
DateRangeFilter.propTypes = TheComponent.propTypes;

export default DateRangeFilter;

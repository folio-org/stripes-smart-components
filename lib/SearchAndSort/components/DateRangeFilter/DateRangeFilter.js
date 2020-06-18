import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { TextField, Button } from '@folio/stripes-components';

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

export default class DateRangeFilter extends Component {
  static propTypes = {
    dateFormat: PropTypes.string,
    makeFilterString: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    selectedValues: PropTypes.shape({
      endDate: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    dateFormat: 'YYYY-MM-DD'
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      dateFormat,
      selectedValues: nextSelectedDates,
    } = nextProps;

    const { prevSelectedDates } = prevState;

    let validationDataUpdates = {};

    const selectedDatesAreSetFirstTime =
      (prevSelectedDates.startDate === '' && prevSelectedDates.endDate === '')
      && (nextSelectedDates.startDate !== '' || nextSelectedDates.endDate !== '');

    const selectedDatesAreReset =
      nextSelectedDates.startDate === '' && nextSelectedDates.endDate === ''
      && prevSelectedDates.startDate !== '' && prevSelectedDates.endDate !== '';

    if (selectedDatesAreSetFirstTime) {
      validationDataUpdates = validateDateRange(nextSelectedDates, dateFormat);
    } else if (selectedDatesAreReset) {
      validationDataUpdates = defaultFilterState;
    }

    return {
      ...validationDataUpdates,
      prevSelectedDates: nextSelectedDates
    };
  }

  constructor(props) {
    super(props);

    const {
      startDate,
      endDate,
    } = props.selectedValues;

    this.startDateInput = React.createRef();
    this.endDateInput = React.createRef();

    this.state = {
      ...this.getInitialValidationData(),
      prevSelectedDates: {
        startDate,
        endDate,
      },
    };
  }

  getInitialValidationData() {
    const {
      startDate,
      endDate,
    } = this.props.selectedValues;

    const dateRangeIsNotEmpty = startDate !== '' || endDate !== '';

    return dateRangeIsNotEmpty
      ? validateDateRange(this.props.selectedValues)
      : defaultFilterState;
  }

  onApplyButtonClick = () => {
    const {
      applyFilterIfValid,
      props: { dateFormat },
    } = this;

    const {
      prevSelectedDates: {
        startDate: prevStartDate,
        endDate: prevEndDate,
      }
    } = this.state;

    const dateRange = {
      startDate: this.startDateInput.current.value,
      endDate: this.endDateInput.current.value,
    };
    const bothDatesEmpty = dateRange.startDate === '' && dateRange.endDate === '';
    const prevDatesWereSet = prevStartDate !== '' && prevEndDate !== '';
    const filterWasReset = bothDatesEmpty && prevDatesWereSet;

    if (filterWasReset) {
      this.clearFilter();
    } else if (!bothDatesEmpty) {
      const validationData = validateDateRange(dateRange, dateFormat);
      this.setState(validationData, applyFilterIfValid);
    }
  }

  applyFilterIfValid = () => {
    const { dateRangeValid } = this.state;

    if (dateRangeValid) {
      this.applyFilter();
    }
  };

  applyFilter() {
    const {
      name: filterName,
      onChange: setFilterValue,
      makeFilterString,
    } = this.props;

    const startDate = this.startDateInput.current.value;
    const endDate = this.endDateInput.current.value;

    const filterString = makeFilterString(startDate, endDate);

    setFilterValue({
      name: filterName,
      values: [filterString]
    });
  }

  clearFilter() {
    const {
      name: filterName,
      onChange: setFilterValue,
    } = this.props;

    setFilterValue({
      name: filterName,
      values: []
    });
  }

  onDateBlur = (e) => {
    const {
      name: dateType,
      value: date,
    } = e.target;

    const { dateFormat } = this.props;

    const dateIsEmpty = date === '';

    const dateIsInvalid = !dateIsEmpty && !isDateValid(date, dateFormat);
    const errorName = `${dateType}Invalid`;

    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        [errorName]: dateIsInvalid
      }
    }));
  }

  renderInvalidDateError(dateType) {
    return (
      <span data-test-invalid-date={dateType}>
        <FormattedMessage id="stripes-smart-components.dateRange.invalidDate" />
      </span>
    );
  }

  renderMissingDateError(dateType) {
    const translationId = dateType === DATE_TYPES.START
      ? 'stripes-smart-components.dateRange.missingStartDate'
      : 'stripes-smart-components.dateRange.missingEndDate';

    return (
      <span data-test-missing-date={dateType}>
        <FormattedMessage id={translationId} />
      </span>
    );
  }

  renderInvalidOrderError() {
    return (
      <span
        className={styles.validationMessage}
        data-test-wrong-dates-order
      >
        <FormattedMessage id="stripes-smart-components.dateRange.wrongOrder" />
      </span>
    );
  }

  getStartDateError() {
    const {
      startDateInvalid,
      startDateMissing,
    } = this.state.errors;

    return (startDateInvalid && this.renderInvalidDateError(DATE_TYPES.START))
      || (startDateMissing && this.renderMissingDateError(DATE_TYPES.START));
  }

  getEndDateError() {
    const {
      endDateInvalid,
      endDateMissing,
    } = this.state.errors;

    return (endDateInvalid && this.renderInvalidDateError(DATE_TYPES.END))
      || (endDateMissing && this.renderMissingDateError(DATE_TYPES.END));
  }

  render() {
    const {
      selectedValues: {
        startDate,
        endDate,
      },
      dateFormat,
    } = this.props;

    const { wrongDatesOrder } = this.state.errors;

    const startDateError = this.getStartDateError();
    const endDateError = this.getEndDateError();

    return (
      <>
        <TextField
          name={DATE_TYPES.START}
          onBlur={this.onDateBlur}
          label={<FormattedMessage id="stripes-smart-components.dateRange.from" />}
          inputRef={this.startDateInput}
          value={startDate}
          placeholder={dateFormat}
          error={startDateError || undefined}
          data-test-date-input={DATE_TYPES.START}
        />
        <TextField
          name={DATE_TYPES.END}
          onBlur={this.onDateBlur}
          label={<FormattedMessage id="stripes-smart-components.dateRange.to" />}
          inputRef={this.endDateInput}
          value={endDate}
          placeholder={dateFormat}
          error={endDateError || undefined}
          data-test-date-input={DATE_TYPES.END}
        />
        {wrongDatesOrder && this.renderInvalidOrderError()}
        <Button
          onClick={this.onApplyButtonClick}
          data-test-apply-button
          marginBottom0
        >
          <FormattedMessage id="stripes-smart-components.dateRange.apply" />
        </Button>
      </>
    );
  }
}

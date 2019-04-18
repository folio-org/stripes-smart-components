import React, { Component, Fragment } from 'react';
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
  isDateRangeValid: false,
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

    const areSelectedDatesSetFirstTime =
      (prevSelectedDates.startDate === '' && prevSelectedDates.endDate === '')
      && (nextSelectedDates.startDate !== '' || nextSelectedDates.endDate !== '');

    const areSelectedDatesReset =
      nextSelectedDates.startDate === '' && nextSelectedDates.endDate === ''
      && prevSelectedDates.startDate !== '' && prevSelectedDates.endDate !== '';


    if (areSelectedDatesSetFirstTime) {
      validationDataUpdates = validateDateRange(nextSelectedDates, dateFormat);
    } else if (areSelectedDatesReset) {
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

    const dateRangeIsNotEmpty = startDate !== '' || endDate !== '';
    const validationData = dateRangeIsNotEmpty
      ? validateDateRange(props.selectedValues)
      : defaultFilterState;

    this.state = {
      ...validationData,
      prevSelectedDates: {
        startDate,
        endDate,
      },
    };
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
    const areBothDatesEmpty = dateRange.startDate === '' && dateRange.endDate === '';
    const werePrevDatesSet = prevStartDate !== '' && prevEndDate !== '';
    const filterWasReset = areBothDatesEmpty && werePrevDatesSet;

    if (filterWasReset) {
      this.clearFilter();
    } else if (!areBothDatesEmpty) {
      const dateValidationData = validateDateRange(dateRange, dateFormat);
      this.setState(dateValidationData, applyFilterIfValid);
    }
  }

  applyFilterIfValid = () => {
    const { isDateRangeValid } = this.state;

    if (isDateRangeValid) {
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

    const isDateEmpty = date === '';

    const isDateInvalid = !isDateEmpty && !isDateValid(date, dateFormat);
    const errorName = `${dateType}Invalid`;

    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        [errorName]: isDateInvalid
      }
    }));
  }

  renderApplyButton() {
    return (
      <Button
        onClick={this.onApplyButtonClick}
        data-test-apply-button
        marginBottom0
      >
        <FormattedMessage id="stripes-smart-components.dateRange.apply" />
      </Button>
    );
  }

  renderInvalidDateError(dateType) {
    return (
      <span data-test-invalid-date={dateType}>
        <FormattedMessage id="stripes-smart-components.dateRange.invalidDate" />
      </span>
    );
  }

  renderMissingDateMessage(dateType) {
    const translationId = dateType === DATE_TYPES.START
      ? 'stripes-smart-components.dateRange.missingStartDate'
      : 'stripes-smart-components.dateRange.missingEndDate';

    return (
      <span data-test-missing-date={dateType}>
        <FormattedMessage id={translationId} />
      </span>
    );
  }

  renderInvalidOrderMessage() {
    return (
      <span
        className={styles.validationMessage}
        data-test-wrong-dates-order
      >
        <FormattedMessage id="stripes-smart-components.dateRange.wrongOrder" />
      </span>
    );
  }

  render() {
    const {
      selectedValues: {
        startDate,
        endDate,
      },
      dateFormat,
    } = this.props;

    const {
      startDateInvalid,
      endDateInvalid,
      startDateMissing,
      endDateMissing,
      wrongDatesOrder,
    } = this.state.errors;

    const startDateError =
      (startDateInvalid && this.renderInvalidDateError(DATE_TYPES.START))
      || (startDateMissing && this.renderMissingDateMessage(DATE_TYPES.START));


    const endDateError =
      (endDateInvalid && this.renderInvalidDateError(DATE_TYPES.END))
      || (endDateMissing && this.renderMissingDateMessage(DATE_TYPES.END));

    return (
      <Fragment>
        <TextField
          name={DATE_TYPES.START}
          onBlur={this.onDateBlur}
          label={<FormattedMessage id="stripes-smart-components.dateRange.from" />}
          inputRef={this.startDateInput}
          value={startDate}
          placeholder={dateFormat}
          error={startDateError}
          data-test-date-input={DATE_TYPES.START}
        />
        <TextField
          name={DATE_TYPES.END}
          onBlur={this.onDateBlur}
          label={<FormattedMessage id="stripes-smart-components.dateRange.to" />}
          inputRef={this.endDateInput}
          value={endDate}
          placeholder={dateFormat}
          error={endDateError}
          data-test-date-input={DATE_TYPES.END}
        />
        {wrongDatesOrder && this.renderInvalidOrderMessage()}
        {this.renderApplyButton()}
      </Fragment>
    );
  }
}

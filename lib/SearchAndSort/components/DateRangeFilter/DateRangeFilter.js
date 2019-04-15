import React, { Component, Fragment } from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { TextField, Button } from '@folio/stripes-components';

import {
  isDateValid,
  validateDateRange,
} from './date-validations';

import styles from './DateRange.css';

const invalidDateMessage = <FormattedMessage id="stripes-smart-components.dateRange.invalidDate" />;
const startDateMissingMessage = <FormattedMessage id="stripes-smart-components.dateRange.missingStartDate" />;
const endDateMissingMessage = <FormattedMessage id="stripes-smart-components.dateRange.missingEndDate" />;
const invalidOrderMessage = (
  <span className={styles.validationMessage}>
    <FormattedMessage id="stripes-smart-components.dateRange.wrongOrder" />
  </span>
);

const defaultFilterState = {
  areBothDatesEmpty: true,
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
    selectedDates: PropTypes.shape({
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
      selectedDates: nextSelectedDates,
    } = nextProps;

    const { prevSelectedDates } = prevState;

    const areSelectedDatesSetFirstTime = nextSelectedDates.startDate !== '' && nextSelectedDates.endDate !== ''
      && prevSelectedDates.startDate === '' && prevSelectedDates.endDate === '';

    const areSelectedDatesReset = nextSelectedDates.startDate === '' && nextSelectedDates.endDate === ''
      && prevSelectedDates.startDate !== '' && prevSelectedDates.endDate !== '';

    let validationDataUpdates = {};

    if (areSelectedDatesSetFirstTime || areSelectedDatesReset) {
      validationDataUpdates = validateDateRange(nextSelectedDates, dateFormat);
    }

    return {
      ...validationDataUpdates,
      prevSelectedDates: nextSelectedDates
    };
  }

  state = {
    ...defaultFilterState,
    prevSelectedDates: {
      startDate: this.props.selectedDates.startDate,
      endDate: this.props.selectedDates.endDate,
    }
  };

  startDateInput = React.createRef();
  endDateInput = React.createRef();

  onApply = () => {
    const {
      handleValidation: afterValidation,
      props: {
        dateFormat,
      }
    } = this;

    const dateRange = {
      startDate: this.startDateInput.current.value,
      endDate: this.endDateInput.current.value,
    };

    const dateValidationData = validateDateRange(dateRange, dateFormat);

    this.setState(dateValidationData, afterValidation);
  }

  handleValidation = () => {
    const {
      isDateRangeValid,
      areBothDatesEmpty,
      prevSelectedDates: {
        startDate: prevStartDate,
        endDate: prevEndDate,
      }
    } = this.state;

    const werePrevDatesSet = prevStartDate !== '' && prevEndDate !== '';
    const filterWasReset = areBothDatesEmpty && werePrevDatesSet;

    if (filterWasReset) {
      this.clearFilter();
    } else if (isDateRangeValid) {
      this.setFilterValue();
    }
  };

  setFilterValue() {
    const {
      name: filterName,
      makeFilterString,
      onChange: applyFilter,
    } = this.props;

    const startDate = this.startDateInput.current.value;
    const endDate = this.endDateInput.current.value;

    const filterString = makeFilterString(startDate, endDate);

    applyFilter({
      name: filterName,
      values: [filterString]
    });
  }


  clearFilter() {
    const {
      name: filterName,
      onChange: applyFilter,
    } = this.props;

    applyFilter({
      name: filterName,
      values: []
    });
  }

  onDateBlur = (e) => {
    const {
      name: dateType,
      value,
    } = e.target;

    const isDateInvalid = !this.isDateValid(value);
    const errorName = `${dateType}Invalid`;

    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        [errorName]: isDateInvalid
      }
    }));
  }

  isDateValid = (date) => {
    const { dateFormat } = this.props;

    return isDateValid(date, dateFormat);
  }

  renderApplyButton() {
    return (
      <Button
        onClick={this.onApply}
        marginBottom0
      >
        <FormattedMessage id="stripes-smart-components.dateRange.apply" />
      </Button>
    );
  }

  render() {
    const {
      selectedDates: {
        startDate,
        endDate
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
      (startDateInvalid && invalidDateMessage)
      || (startDateMissing && startDateMissingMessage);

    const endDateError =
      (endDateInvalid && invalidDateMessage)
      || (endDateMissing && endDateMissingMessage);

    return (
      <Fragment>
        <TextField
          className={styles.general}
          inputClass={styles.input}
          dirty={false}
          name="startDate"
          onBlur={this.onDateBlur}
          label={<FormattedMessage id="stripes-smart-components.dateRange.from" />}
          inputRef={this.startDateInput}
          value={startDate}
          placeholder={dateFormat}
          error={startDateError}
        />
        <TextField
          name="endDate"
          onBlur={this.onDateBlur}
          label={<FormattedMessage id="stripes-smart-components.dateRange.to" />}
          inputRef={this.endDateInput}
          value={endDate}
          placeholder={dateFormat}
          error={endDateError}
        />
        {wrongDatesOrder && invalidOrderMessage}
        {this.renderApplyButton()}
      </Fragment>
    );
  }
}

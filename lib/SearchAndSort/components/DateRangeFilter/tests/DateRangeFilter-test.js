import React from 'react';

import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { TextInput, Datepicker, Button, HTML, converge } from '@folio/stripes-testing';

import { setupApplication, mount } from '../../../../../tests/helpers';

import DateRangeFilter from '../DateRangeFilter';
import { validateDateRange } from '../date-validations';
import DATE_TYPES from '../date-types';

const filterName = 'dateRange';
const dateFormat = 'YYYY-MM-DD';
const invalidMessage = 'Please enter a valid date';
const invalidYearMessage = 'Please enter a valid year';
const missingStartDateMessage = 'Please enter a start date';
const missingEndDateMessage = 'Please enter an end date';
const wrongOrderMessage = 'Start date is greater than end date';
const makeDateRangeFilterString = (startDate, endDate) => `${startDate}:${endDate}`;
const onChangeHandler = sinon.spy();

const AriaLabeledField = TextInput.extend('aria text field')
  .filters({
    'ariaLabel': (el) => el.getAttribute('aria-label'),
  });

const ErrorInteractor = HTML.extend('validation error')
  .selector('[role="alert"]')
  .locator(el => el.innerText);

const DateRangeFilterHarness = ({ selectedDates = { startDate: '', endDate: ''  }, ...rest }) => { // eslint-disable-line
  return (
    <DateRangeFilter
      name={filterName}
      selectedValues={selectedDates}
      onChange={onChangeHandler}
      makeFilterString={makeDateRangeFilterString}
      dateFormat={dateFormat}
      {...rest}
    />
  );
};

describe('DateRangeFilter', () => {
  const startPicker = Datepicker('From');
  const endPicker = Datepicker('To');
  const applyButton = Button('Apply');

  beforeEach(() => {
    onChangeHandler.resetHistory();
  });

  describe('rendering', () => {
    setupApplication({
      component: <DateRangeFilterHarness />
    });

    describe('when date range filter is rendered', () => {
      beforeEach(async () => {
        await mount(<DateRangeFilterHarness />);
      });

      it('renders start datePicker', () => startPicker.exists());
      it('renders end datePicker', () => endPicker.exists());

      it('should render apply button', () => applyButton.exists());

      it('should display the date format as a placeholder', () => startPicker.has({ placeholder: dateFormat }));
    });

    describe('and invalid start date was entered', () => {
      beforeEach(async () => {
        await startPicker.fillIn('1999-13-32');
      });

      it('should display corresponding error below start date input', () => startPicker.find(ErrorInteractor(invalidMessage)).exists());

      describe('and "Apply" button was clicked', () => {
        beforeEach(async () => {
          await applyButton.click();
        });

        it('should not apply filter', () => converge(() => { if (onChangeHandler.called) throw Error('expected onChangeHandler to not be called!'); }));
      });
    });

    describe('and invalid end date was entered', () => {
      beforeEach(async () => {
        await endPicker.fillIn('2000-13-32');
      });

      it('should display corresponding error below the end date input', () => endPicker.find(ErrorInteractor(invalidMessage)).exists());

      describe('and "Apply" button was clicked', () => {
        beforeEach(async () => {
          await applyButton.click();
        });

        it('should not apply filter', () => converge(() => { if (onChangeHandler.called) throw Error('expected onChangeHandler to not be called!'); }));
      });
    });

    describe('and both dates are invalid', () => {
      beforeEach(async () => {
        await startPicker.fillIn('1999-13-32');
        await endPicker.fillIn('1999-13-32');
      });

      it('should display corresponding error below start date input', () => startPicker.find(ErrorInteractor(invalidMessage)).exists());
      it('should display corresponding error below end date input', () => endPicker.find(ErrorInteractor(invalidMessage)).exists());
    });

    describe('when start date is missing and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await endPicker.fillIn('2005-01-03');
        await applyButton.click();
      });

      it('should display corresponding error below the start date input', () => startPicker.find(ErrorInteractor(missingStartDateMessage)).exists());

      it('should not apply the filter', () => converge(() => { if (onChangeHandler.called) throw Error('expected onChangeHandler to not be called!'); }));
    });

    describe('when end date is missing and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await startPicker.fillIn('2005-01-03');
        await applyButton.click();
      });

      it('should display corresponding error below the end date input', () => endPicker.find(ErrorInteractor(missingEndDateMessage)).exists());

      it('should not apply the filter', () => converge(() => { if (onChangeHandler.called) throw Error('expected onChangeHandler to not be called!'); }));
    });

    describe('when start date is greater that end date and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await startPicker.fillIn('2005-01-03');
        await endPicker.fillIn('2000-01-03');
        await applyButton.click();
      });

      it('should display corresponding error below the filter', () => ErrorInteractor('Start date is greater than end date').exists());

      it('should not apply the filter', () => converge(() => { if (onChangeHandler.called) throw Error('expected onChangeHandler to not be called!'); }));

      describe('and then both dates were cleared', () => {
        beforeEach(async () => {
          await startPicker.fillIn('');
          await endPicker.fillIn('');
        });

        it('should not display an error below the filter', () => ErrorInteractor('Start date is greater than end date').absent());
      });
    });

    describe('when date range is correct and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await startPicker.fillIn('2005-01-03');
        await endPicker.fillIn('2010-01-03');
        await applyButton.click();
      });

      it('should apply the filter', () => {
        const resultingFilterValue = makeDateRangeFilterString('2005-01-03', '2010-01-03');

        const expectedArguments = {
          name: filterName,
          values: [resultingFilterValue],
        };

        return converge(() => { if (!onChangeHandler.calledWith(expectedArguments)) throw Error('expected onChangeHandler to not be called!'); });
      });
    });
  });

  describe('when filter is rendered with predefined date range (using a url containing a date range in params)', () => {
    describe('and provided start date is invalid', () => {
      setupApplication({
        component: (
          <DateRangeFilterHarness
            selectedDates={{
              startDate: '2005-55-55',
              endDate: '2006-01-01',
            }}
          />)
      });

      it('should display corresponding error below the start date input', () => startPicker.find(ErrorInteractor(invalidMessage)).exists());

      describe('and "Apply" button was clicked', () => {
        beforeEach(async () => {
          await applyButton.click();
        });

        it('should not apply the filter', () => converge(() => { if (onChangeHandler.called) throw Error('expected onChangeHandler to not be called!'); }));
      });
    });
  });

  describe('and provided end date is invalid', () => {
    setupApplication({
      component: (
        <DateRangeFilterHarness
          selectedDates={{
            startDate: '2006-01-01',
            endDate: '2006-41-41',
          }}
        />)
    });


    it('should display corresponding error below the end date input', () => endPicker.find(ErrorInteractor(invalidMessage)).exists());


    describe('and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await applyButton.click();
      });

      it('should not apply the filter', () => converge(() => { if (onChangeHandler.called) throw Error('expected onChangeHandler to not be called!'); }));
    });
  });

  describe('when YYYY format is used and the provided year is invalid', () => {
    setupApplication({
      component: (
        <DateRangeFilterHarness
          dateFormat="YYYY"
          selectedDates={{
            startDate: '',
            endDate: '200a',
          }}
        />)
    });


    it('should display corresponding error below the end date input', () => endPicker.find(ErrorInteractor(invalidYearMessage)).exists());
  });

  describe('and start date is missing', () => {
    setupApplication({
      component: (
        <DateRangeFilterHarness
          selectedDates={{
            startDate: '',
            endDate: '2006-41-01',
          }}
        />)
    });

    it('should display corresponding error below the start date input', () => startPicker.find(ErrorInteractor(missingStartDateMessage)).exists());

    describe('and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await applyButton.click();
      });

      it('should not apply the filter', () => converge(() => { if (onChangeHandler.called) throw Error('expected onChangeHandler to not be called!'); }));
    });
  });

  describe('and start date is greater than end date', () => {
    setupApplication({
      component: (
        <DateRangeFilterHarness
          selectedDates={{
            startDate: '2016-01-01',
            endDate: '2006-01-01',
          }}
          startLabel="test start label"
          endLabel="test end label"
        />)
    });

    it('should display corresponding error below the filter', () => ErrorInteractor(wrongOrderMessage).exists());

    it('should render aria-labels appropriately', () => AriaLabeledField({ ariaLabel: 'test start label' }).exists());

    describe('and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await applyButton.click();
      });

      it('should not apply the filter', () => converge(() => { if (onChangeHandler.called) throw Error('expected onChangeHandler to not be called!'); }));
    });
  });

  describe('when an end date is not required', () => {
    setupApplication({
      component: (
        <DateRangeFilterHarness
          requiredFields={[DATE_TYPES.START]}
        />
      ),
    });

    describe('when applying the range', () => {
      beforeEach(async () => {
        await startPicker.fillIn('2005-01-03');
        await applyButton.click();
      });

      it('should not show end date validation error', () => endPicker.find(ErrorInteractor(invalidMessage)).absent());
    });
  });
});

describe('Validate date range', () => {
  it('both dates present', () => {
    expect(validateDateRange(
      {
        startDate: '2020-06-13',
        endDate:'2021-01-20'
      }, 'YYYY-MM-DD'
    )).to.deep.equal({
      dateRangeValid: true,
      errors: {
        startDateInvalid: false,
        endDateInvalid: false,
        endDateMissing: false,
        startDateMissing: false,
        wrongDatesOrder: false,
      }
    });
  });

  it('both dates present - start invalid', () => {
    expect(validateDateRange(
      {
        startDate: '2025513',
        endDate:'2021-01-20'
      }, 'YYYY-MM-DD'
    )).to.deep.equal({
      dateRangeValid: false,
      errors: {
        startDateInvalid: true,
        endDateInvalid: false,
        endDateMissing: false,
        startDateMissing: false,
        wrongDatesOrder: false,
      }
    });
  });

  it('both dates present - end invalid', () => {
    expect(validateDateRange(
      {
        startDate: '2020-06-13',
        endDate:'20215520'
      }, 'YYYY-MM-DD'
    )).to.deep.equal({
      dateRangeValid: false,
      errors: {
        startDateInvalid: false,
        endDateInvalid: true,
        endDateMissing: false,
        startDateMissing: false,
        wrongDatesOrder: false,
      }
    });
  });

  it('start date missing, both required', () => {
    expect(validateDateRange(
      {
        startDate: '',
        endDate:'2021-01-20'
      }, 'YYYY-MM-DD'
    )).to.deep.equal({
      dateRangeValid: false,
      errors: {
        startDateInvalid: false,
        endDateInvalid: false,
        endDateMissing: false,
        startDateMissing: true,
        wrongDatesOrder: false,
      }
    });
  });

  it('start date missing, both not required', () => {
    expect(validateDateRange(
      {
        startDate: '',
        endDate:'2021-01-20'
      },
      'YYYY-MM-DD',
      [],
    )).to.deep.equal({
      dateRangeValid: true,
      errors: {
        startDateInvalid: false,
        endDateInvalid: false,
        endDateMissing: false,
        startDateMissing: false,
        wrongDatesOrder: false,
      }
    });
  });

  it('start date missing, start date required', () => {
    expect(validateDateRange(
      {
        startDate: '',
        endDate:'2021-01-20'
      },
      'YYYY-MM-DD',
      [DATE_TYPES.START],
    )).to.deep.equal({
      dateRangeValid: false,
      errors: {
        startDateInvalid: false,
        endDateInvalid: false,
        endDateMissing: false,
        startDateMissing: true,
        wrongDatesOrder: false,
      }
    });
  });

  it('end date missing', () => {
    expect(validateDateRange(
      {
        startDate: '2020-06-13',
        endDate:''
      }, 'YYYY-MM-DD'
    )).to.deep.equal({
      dateRangeValid: false,
      errors: {
        startDateInvalid: false,
        endDateInvalid: false,
        endDateMissing: true,
        startDateMissing: false,
        wrongDatesOrder: false,
      }
    });
  });

  it('end date missing, both not required', () => {
    expect(validateDateRange(
      {
        startDate: '2020-06-13',
        endDate:''
      },
      'YYYY-MM-DD',
      []
    )).to.deep.equal({
      dateRangeValid: true,
      errors: {
        startDateInvalid: false,
        endDateInvalid: false,
        endDateMissing: false,
        startDateMissing: false,
        wrongDatesOrder: false,
      }
    });
  });

  it('end date missing, end not required', () => {
    expect(validateDateRange(
      {
        startDate: '2020-06-13',
        endDate:''
      },
      'YYYY-MM-DD',
      [DATE_TYPES.START]
    )).to.deep.equal({
      dateRangeValid: true,
      errors: {
        startDateInvalid: false,
        endDateInvalid: false,
        endDateMissing: false,
        startDateMissing: false,
        wrongDatesOrder: false,
      }
    });
  });

  it('both dates missing, both required', () => {
    expect(validateDateRange(
      {
        startDate: '',
        endDate:''
      },
      'YYYY-MM-DD',
    )).to.deep.equal({
      dateRangeValid: false,
      errors: {
        startDateInvalid: false,
        endDateInvalid: false,
        endDateMissing: true,
        startDateMissing: true,
        wrongDatesOrder: false,
      }
    });
  });
});

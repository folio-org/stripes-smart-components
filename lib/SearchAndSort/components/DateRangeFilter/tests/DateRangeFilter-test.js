import React from 'react';

import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { setupApplication, mount } from '../../../../../tests/helpers';

import DateRangeFilter from '../DateRangeFilter';
import DateRangeFilterInteractor from './interactor';
import { validateDateRange } from '../date-validations';
import DATE_TYPES from '../date-types';

const dateRangeFilter = new DateRangeFilterInteractor();

const filterName = 'dateRange';
const dateFormat = 'YYYY-MM-DD';
const makeDateRangeFilterString = (startDate, endDate) => `${startDate}:${endDate}`;
const onChangeHandler = sinon.spy();


const DateRangeFilterHarness = ({ selectedDates = { startDate: '', endDate: '' } }) => { // eslint-disable-line
  return (
    <DateRangeFilter
      name={filterName}
      selectedValues={selectedDates}
      onChange={onChangeHandler}
      makeFilterString={makeDateRangeFilterString}
      dateFormat={dateFormat}
    />
  );
};

describe('DateRangeFilter', () => {
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

      it('should render inputs for start and end dates', () => {
        expect(dateRangeFilter.startDateInput.isPresent).to.be.true;
        expect(dateRangeFilter.endDateInput.isPresent).to.be.true;
      });

      it('should render apply button', () => {
        expect(dateRangeFilter.applyButton.isPresent).to.be.true;
      });

      it('should display the date format as a placeholder', () => {
        expect(dateRangeFilter.startDateInput.placeholder).to.equal(dateFormat);
        expect(dateRangeFilter.endDateInput.placeholder).to.equal(dateFormat);
      });
    });

    describe('and invalid start date was entered', () => {
      beforeEach(async () => {
        await dateRangeFilter.startDateInput.enterDate('1999-13-32');
      });

      it('should display corresponding error below start date input', () => {
        expect(dateRangeFilter.invalidStartDateErrorDisplayed).to.be.true;
      });

      describe('and "Apply" button was clicked', () => {
        beforeEach(async () => {
          await dateRangeFilter.applyButton.click();
        });

        it('should not apply filter', () => {
          expect(onChangeHandler.called).to.be.false;
        });
      });
    });

    describe('and invalid end date was entered', () => {
      beforeEach(async () => {
        await dateRangeFilter.endDateInput.enterDate('2000-13-32');
      });

      it('should display corresponding error below the end date input', () => {
        expect(dateRangeFilter.invalidEndDateErrorDisplayed).to.be.true;
      });

      describe('and "Apply" button was clicked', () => {
        beforeEach(async () => {
          await dateRangeFilter.applyButton.click();
        });

        it('should not apply filter', () => {
          expect(onChangeHandler.called).to.be.false;
        });
      });
    });

    describe('when start date is missing and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await dateRangeFilter.endDateInput.enterDate('2005-01-03');
        await dateRangeFilter.applyButton.click();
      });

      it('should display corresponding error below the start date input', () => {
        expect(dateRangeFilter.missingStartDateErrorDisplayed).to.be.true;
      });

      it('should not apply the filter', () => {
        expect(onChangeHandler.called).to.be.false;
      });
    });

    describe('when end date is missing and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await dateRangeFilter.startDateInput.enterDate('2005-01-03');
        await dateRangeFilter.applyButton.click();
      });

      it('should display corresponding error below the end date input', () => {
        expect(dateRangeFilter.missingEndDateErrorDisplayed).to.be.true;
      });

      it('should not apply the filter', () => {
        expect(onChangeHandler.called).to.be.false;
      });
    });

    describe('when start date is greater that end date and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await dateRangeFilter.startDateInput.enterDate('2005-01-03');
        await dateRangeFilter.endDateInput.enterDate('2000-01-03');
        await dateRangeFilter.applyButton.click();
      });

      it('should display corresponding error below the filter', () => {
        expect(dateRangeFilter.wrongOrderDatesErrorDisplayed).to.be.true;
      });

      it('should not apply the filter', () => {
        expect(onChangeHandler.called).to.be.false;
      });
    });

    describe('when date range is correct and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await dateRangeFilter.startDateInput.enterDate('2005-01-03');
        await dateRangeFilter.endDateInput.enterDate('2010-01-03');
        await dateRangeFilter.applyButton.click();
      });

      it('should apply the filter', () => {
        const resultingFilterValue = makeDateRangeFilterString('2005-01-03', '2010-01-03');

        const expectedArguments = {
          name: filterName,
          values: [resultingFilterValue],
        };

        expect(onChangeHandler.calledWith(expectedArguments)).to.be.true;
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

      it('should display corresponding error below start date input', () => {
        expect(dateRangeFilter.invalidStartDateErrorDisplayed).to.be.true;
      });

      describe('and "Apply" button was clicked', () => {
        beforeEach(async () => {
          await dateRangeFilter.applyButton.click();
        });

        it('should not apply filter', () => {
          expect(onChangeHandler.called).to.be.false;
        });
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

    it('should display corresponding error below the end date input', () => {
      expect(dateRangeFilter.invalidEndDateErrorDisplayed).to.be.true;
    });

    describe('and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await dateRangeFilter.applyButton.click();
      });

      it('should not apply filter', () => {
        expect(onChangeHandler.called).to.be.false;
      });
    });
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

    it('should display corresponding error below start date input', () => {
      expect(dateRangeFilter.missingStartDateErrorDisplayed).to.be.true;
    });

    describe('and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await dateRangeFilter.applyButton.click();
      });

      it('should not apply filter', () => {
        expect(onChangeHandler.called).to.be.false;
      });
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
        />)
    });

    it('should display corresponding error below the filter', () => {
      expect(dateRangeFilter.wrongOrderDatesErrorDisplayed).to.be.true;
    });

    describe('and "Apply" button was clicked', () => {
      beforeEach(async () => {
        await dateRangeFilter.applyButton.click();
      });

      it('should not apply filter', () => {
        expect(onChangeHandler.called).to.be.false;
      });
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

import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import { Button } from '@folio/stripes-components';
import { AVAILABLE_PLACEMENTS } from '@folio/stripes-components/lib/Popper';

import { validateDateRange } from './date-validations';
import DATE_TYPES from './date-types';
import styles from './DateRange.css';

import { Field } from './Field';


const InvalidDateError = ({ dateType }) => (
  <span data-test-invalid-date={dateType}>
    <FormattedMessage id="stripes-smart-components.dateRange.invalidDate" />
  </span>
);


const MissingDateError = ({ dateType }) => {
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


const DateRangeFilter = ({
  dateFormat = 'YYYY-MM-DD',
  placement = 'right-start',
  name,
  selectedValues,
  makeFilterString,
  onChange,
}) => {
  const handleFormSubmit = values => {
    const filterString = makeFilterString(values.startDate, values.endDate);

    onChange({
      name,
      values: [filterString]
    });
  };

  const validate = values => {
    const { dateRangeValid, errors } = validateDateRange(values, dateFormat);

    if (dateRangeValid) return undefined;

    return {
      [DATE_TYPES.START]:
        (errors.startDateInvalid && <InvalidDateError dateType={DATE_TYPES.START} />) ||
        (errors.startDateMissing && <MissingDateError dateType={DATE_TYPES.START} />) ||
        undefined,
      [DATE_TYPES.END]:
        (errors.endDateInvalid && <InvalidDateError dateType={DATE_TYPES.END} />) ||
        (errors.endDateMissing && <MissingDateError dateType={DATE_TYPES.END} />) ||
        undefined,
      [FORM_ERROR]: errors.wrongDatesOrder ? <InvalidOrderError /> : undefined,
    };
  };

  return (
    <Form
      onSubmit={handleFormSubmit}
      initialValues={selectedValues}
      validate={validate}
    >
      {({ handleSubmit, error }) => (
        <>
          <Field
            name={DATE_TYPES.START}
            label={<FormattedMessage id="stripes-smart-components.dateRange.from" />}
            dateFormat={dateFormat}
            onKeyDown={e => (e.key === 'Enter') && handleSubmit()}
            placement={placement}
          />
          <Field
            name={DATE_TYPES.END}
            label={<FormattedMessage id="stripes-smart-components.dateRange.to" />}
            dateFormat={dateFormat}
            onKeyDown={e => (e.key === 'Enter') && handleSubmit()}
            placement={placement}
          />

          {error}

          <Button
            data-test-apply-button
            marginBottom0
            onClick={handleSubmit}
          >
            <FormattedMessage id="stripes-smart-components.dateRange.apply" />
          </Button>
        </>
      )}
    </Form>
  );
};

DateRangeFilter.propTypes = {
  dateFormat: PropTypes.string,
  makeFilterString: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placement: PropTypes.oneOf(AVAILABLE_PLACEMENTS),
  selectedValues: PropTypes.shape({
    endDate: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
  }).isRequired,
};

export default DateRangeFilter;

import React from 'react';
import { useField } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import { Datepicker } from '@folio/stripes/components';

import { isDateValid } from './date-validations';

export const Field = ({ name, dateFormat, ...rest }) => {
  const validate = date => {
    const dateIsEmpty = date === '';
    const dateIsInvalid = !dateIsEmpty && !isDateValid(date, dateFormat);

    if (dateIsInvalid) {
      return (
        <span data-test-invalid-date={name}>
          <FormattedMessage id="stripes-smart-components.dateRange.invalidDate" />
        </span>
      );
    }

    return undefined;
  };

  const { input, meta } = useField(name, { validate });

  return (
    <Datepicker
      dateFormat={dateFormat}
      data-test-date-input={name}
      usePortal

      // Datepicker doesn't work well with final-form `input` and `meta` API
      // so we'll use it "ad-hoc" way
      error={meta && !meta.active && meta.touched && meta.error}
      {...input}

      {...rest}
    />
  );
};

Field.propTypes = Datepicker.propTypes;

export default Field;

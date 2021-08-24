import React from 'react';
import { useField } from 'react-final-form';

import { Datepicker } from '@folio/stripes/components';

export const Field = ({ name, dateFormat, ...rest }) => {
  const { input, meta } = useField(name);

  return (
    <Datepicker
      dateFormat={dateFormat}
      data-test-date-input={name}
      usePortal

      // Datepicker doesn't work well with final-form `input` and `meta` API
      // so we'll use it "ad-hoc" way
      error={!meta.active && meta.touched ? meta.error : undefined}
      {...input}

      {...rest}
    />
  );
};

Field.propTypes = Datepicker.propTypes;

export default Field;

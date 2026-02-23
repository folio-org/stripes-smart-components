import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Datepicker, Row, Timepicker } from '@folio/stripes-components';

const DueDatePickerForm = ({ initialValues, onChange, dateProps, timeProps }) => {
  const [dateTime, updateDateTime] = useState({ ...initialValues });

  React.useEffect(() => onChange(dateTime), [dateTime.date, dateTime.time, onChange]); // eslint-disable-line

  const handleChange = (e, _value, formattedValue) => {
    updateDateTime((cur) => {
      return { ...cur, [e.target.name]: formattedValue };
    });
  };

  return (
    <Row>
      <Col xs={12} sm={6} md={3}>
        <Datepicker {...dateProps} name="date" onChange={handleChange} value={dateTime.date} />
      </Col>
      <Col xs={12} sm={6} md={3}>
        <Timepicker {...timeProps} name="time" onChange={handleChange} value={dateTime.time} timeZone="UTC" />
      </Col>
    </Row>
  );
};

DueDatePickerForm.propTypes = {
  dateProps: PropTypes.object,
  timeProps: PropTypes.object,
  initialValues: PropTypes.object,
  onChange: PropTypes.func,
};

export default DueDatePickerForm;


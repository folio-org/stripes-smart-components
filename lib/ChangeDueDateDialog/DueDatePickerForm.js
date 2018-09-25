import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import stripesForm from '@folio/stripes-form';
import { Col, Datepicker, Row, Timepicker } from '@folio/stripes-components';

class DueDatePickerForm extends React.Component {
  static propTypes = {
    dateProps: PropTypes.object,
    timeProps: PropTypes.object,
  }

  render() {
    const { dateProps, timeProps } = this.props;

    return (
      <Row>
        <Col xs={12} sm={6} md={3}>
          <Field
            name="date"
            component={Datepicker}
            timeZone="UTC"
            {...dateProps}
          />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Field
            name="time"
            component={Timepicker}
            timeZone="UTC"
            {...timeProps}
          />
        </Col>
      </Row>
    );
  }
}

export default stripesForm({
  form: 'dueDatePickerForm',
  navigationCheck: false,
})(DueDatePickerForm);

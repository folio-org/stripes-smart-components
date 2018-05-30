import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Datepicker from '@folio/stripes-components/lib/Datepicker/Datepicker';
import Timepicker from '@folio/stripes-components/lib/Timepicker/Timepicker';

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
            ignoreLocalOffset
            {...dateProps}
          />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Field
            name="time"
            component={Timepicker}
            timezone="UTC"
            {...timeProps}
          />
        </Col>
      </Row>
    );
  }
}

export default reduxForm({
  form: 'DueDatePickerForm',
})(DueDatePickerForm);

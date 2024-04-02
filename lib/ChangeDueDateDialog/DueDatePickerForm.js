import React from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { Col, Datepicker, Row, Timepicker } from '@folio/stripes-components';

const DueDatePickerForm = ({ initialValues, onChange, dateProps, timeProps }) => {
  const {
    watch,
    control,
  } = useForm({ defaultValues: initialValues });

  React.useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <Row>
      <Col xs={12} sm={6} md={3}>
        <Controller
          name="date"
          control={control}
          render={({ field }) => <Datepicker {...dateProps} input={field} />}
        />
      </Col>
      <Col xs={12} sm={6} md={3}>
        <Controller
          name="time"
          control={control}
          render={({ field }) => <Timepicker {...timeProps} input={field} timeZone="UTC" />}
        />
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

// class DueDatePickerForm extends React.Component {
//   static propTypes = {
//     dateProps: PropTypes.object,
//     timeProps: PropTypes.object,
//   }

//   render() {
//     const { dateProps, timeProps } = this.props;

//     return (
//       <Row>
//         <Col xs={12} sm={6} md={3}>
//           <Field
//             name="date"
//             component={Datepicker}
//             timeZone="UTC"
//             {...dateProps}
//           />
//         </Col>
//         <Col xs={12} sm={6} md={3}>
//           <Field
//             name="time"
//             component={Timepicker}
//             timeZone="UTC"
//             {...timeProps}
//           />
//         </Col>
//       </Row>
//     );
//   }
// }

// export default stripesForm({
//   form: 'dueDatePickerForm',
//   navigationCheck: false,
// })(DueDatePickerForm);

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { injectIntl } from 'react-intl';

import DueDatePickerForm from './DueDatePickerForm';

class DueDatePicker extends React.Component {
  static propTypes = {
    dateProps: PropTypes.object,
    initialValues: PropTypes.shape({
      date: PropTypes.string,
      time: PropTypes.string,
    }),
    onChange: PropTypes.func,
    timeProps: PropTypes.object
  }

  static defaultProps = {
    dateProps: {
      label: 'Date:',
    },
    timeProps: {
      label: 'Time:',
    },
    onChange: () => {},
    initialValues: {
      date: new Date().toISOString(),
      time: '12:00:00.000Z',
    },
  }

  constructor(props) {
    super(props);

    this.handleChange(props.initialValues);
  }

  handleChange = (values) => {
    const { intl: { timeZone } } = this.props;
    // Values are received in the following form: { date: "2018-10-20T00:00:00.000Z", time: "22:59:00.000Z" }
    const date = values.date.split('T')[0];
    const time = values.time.split(/[Z+-]/)[0];

    const localDatetime = moment.tz(`${date}T${time}`, timeZone);
    const utcDatetime = localDatetime.tz('UTC').format();

    this.props.onChange(utcDatetime);
  }

  render() {
    const { onChange, ...rest } = this.props; // eslint-disable-line no-unused-vars

    return (
      <DueDatePickerForm
        onChange={this.handleChange}
        {...rest}
      />
    );
  }
}

export default injectIntl(DueDatePicker);

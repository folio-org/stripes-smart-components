import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Icon from '@folio/stripes-components/lib/Icon';
import Modal from '@folio/stripes-components/lib/Modal';

import ChangeDueDate from './ChangeDueDate';
import ChangeDueDateSuccess from './ChangeDueDateSuccess';

class ChangeDueDateDialog extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func,
      intl: PropTypes.shape({
        formatMessage: PropTypes.func,
      }),
    }),
    onClose: PropTypes.func,
    open: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.state = {
      succeeded: false,
      alerts: {},
    };

    this.handleCancel = this.handleCancel.bind(this);
    this.handleDueDateChanged = this.handleDueDateChanged.bind(this);
    this.handleDueDateChangeFailed = this.handleDueDateChangeFailed.bind(this);
    this.connectedChangeDueDate = props.stripes.connect(ChangeDueDate);
  }

  handleCancel() {
    this.setState({
      alerts: {},
      succeeded: false
    });

    this.props.onClose();
  }

  handleDueDateChanged(loans) {
    const alerts = {};

    loans.forEach((loan) => {
      alerts[loan.id] = (
        <div style={{ color: 'green' }}>
          <Icon size="small" icon="validation-check" color="green" />
          <FormattedMessage id="stripes-smart-components.cddd.changeSucceeded" />
        </div>
      );
    });

    this.setState({
      succeeded: true,
      alerts,
    });
  }

  handleDueDateChangeFailed(alerts) {
    this.setState({
      succeeded: false,
      alerts,
    });
  }

  render() {
    const { formatMessage } = this.props.stripes.intl;
    const { succeeded } = this.state;

    const BodyComponent = succeeded ? ChangeDueDateSuccess : this.connectedChangeDueDate;
    const modalLabel = succeeded ?
      formatMessage({ id: 'stripes-smart-components.cddd.changeDueDateConfirmation' }) :
      formatMessage({ id: 'stripes-smart-components.cddd.changeDueDate' });

    return (
      <Modal
        size="large"
        dismissible
        closeOnBackgroundClick
        enforceFocus={false} // Needed to allow Calendar in Datepicker to get focus
        onClose={this.props.onClose}
        open={this.props.open}
        label={modalLabel}
      >
        <BodyComponent
          alerts={this.state.alerts}
          onDueDateChanged={this.handleDueDateChanged}
          onDueDateChangeFailed={this.handleDueDateChangeFailed}
          onCancel={this.handleCancel}
          {...this.props}
        />
      </Modal>
    );
  }
}

export default ChangeDueDateDialog;

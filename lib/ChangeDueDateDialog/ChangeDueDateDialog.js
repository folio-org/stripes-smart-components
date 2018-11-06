import React from 'react';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { Icon, Modal } from '@folio/stripes-components';

import ChangeDueDate from './ChangeDueDate';
import ChangeDueDateSuccess from './ChangeDueDateSuccess';
import css from './ChangeDueDateDialog.css';

class ChangeDueDateDialog extends React.Component {
  static fetchLoans(props) {
    props.mutator.loans.reset();
    props.mutator.loans.GET();
  }

  static manifest = {
    loans: {
      type: 'okapi',
      path: 'circulation/loans?query=(userId=!{user.id} and status.name<>Closed)',
      throwErrors: false,
      accumulate: true,
      PUT: {
        path: 'circulation/loans/%{loanId}',
      },
    },
  }

  static propTypes = {
    loanIds: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ),
    mutator: PropTypes.shape({
      loans: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    resources: PropTypes.shape({ // eslint-disable-line
      loans: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            dueDate: PropTypes.string,
            id: PropTypes.string,
            itemId: PropTypes.string,
            loanDate: PropTypes.string,
          })
        )
      })
    }).isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func
    }),
  }

  static defaultProps = {
    loanIds: [],
  }

  constructor(props) {
    super(props);

    this.state = {
      succeeded: false,
      alerts: {},
      open: false, // eslint-disable-line react/no-unused-state
      loanIds: [], // eslint-disable-line react/no-unused-state
    };

    this.handleCancel = this.handleCancel.bind(this);
    this.handleDueDateChanged = this.handleDueDateChanged.bind(this);
    this.handleDueDateChangeFailed = this.handleDueDateChangeFailed.bind(this);
    this.connectedChangeDueDate = props.stripes.connect(ChangeDueDate);
  }

  static getDerivedStateFromProps(props, state) {
    const newState = {};
    if (!state.open && props.open) {
      ChangeDueDateDialog.fetchLoans(props);
      newState.open = true;
    }

    const loanIds = props.loanIds.map(l => l.id);
    if (isEqual(loanIds, state.loanIds) === false) {
      newState.loanIds = loanIds;
    }

    if (Object.keys(newState).length) return newState;

    return null;
  }

  handleCancel() {
    this.setState({
      alerts: {},
      succeeded: false
    });

    this.props.onClose();
  }

  handleDueDateChangeFailed(alerts) {
    this.setState({
      succeeded: false,
      alerts,
    });

    ChangeDueDateDialog.fetchLoans(this.props);
  }

  handleDueDateChanged(loans) {
    const alerts = {};

    loans.forEach((loan) => {
      alerts[loan.id] = (
        <div className={css.success}>
          <Icon size="small" icon="validation-check" status="success" />
          <FormattedMessage id="stripes-smart-components.cddd.changeSucceeded" />
        </div>
      );
    });

    this.setState({
      succeeded: true,
      dueDatesChanged: loans.length,
      alerts,
    });

    ChangeDueDateDialog.fetchLoans(this.props);
  }

  loans() {
    const userLoans = get(this.props, ['resources', 'loans', 'records', 0, 'loans'], []);
    return userLoans.filter(l => this.state.loanIds.includes(l.id));
  }

  render() {
    const { succeeded } = this.state;

    const BodyComponent = succeeded ? ChangeDueDateSuccess : this.connectedChangeDueDate;
    const modalLabel = succeeded ?
      <FormattedMessage id="stripes-smart-components.cddd.changeDueDateConfirmation" /> :
      <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />;

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
          {...this.props}
          alerts={this.state.alerts}
          onDueDateChanged={this.handleDueDateChanged}
          onDueDateChangeFailed={this.handleDueDateChangeFailed}
          onCancel={this.handleCancel}
          loans={this.loans()}
          dueDatesChanged={this.state.dueDatesChanged}
        />
      </Modal>
    );
  }
}

export default ChangeDueDateDialog;

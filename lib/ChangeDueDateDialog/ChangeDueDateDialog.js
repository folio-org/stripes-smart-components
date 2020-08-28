import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  isEqual,
  isEmpty,
} from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
  Icon,
  Modal,
  Layout,
  Spinner,
} from '@folio/stripes-components';

import ChangeDueDate from './ChangeDueDate';
import ChangeDueDateSuccess from './ChangeDueDateSuccess';
import getErrorMessage from './utils';

import css from './ChangeDueDateDialog.css';

class ChangeDueDateDialog extends React.Component {
  static getOpenRequestsQuery(props) {
    const userLoans = get(props, 'resources.loans.records', []);
    const loanIds = props.loanIds.map(loan => loan.id);
    const selectedLoans = userLoans.filter(loan => loanIds.includes(loan.id));

    if (!selectedLoans.length) return null;

    const itemsIds = selectedLoans.map(loan => `itemId==${loan.itemId}`).join(' or ');
    const statuses = '"Open - Awaiting pickup" or "Open - Not yet filled"';
    const query = `(${itemsIds}) and status==(${statuses}) sortby requestDate desc`;

    return { query };
  }

  static fetchData(props) {
    props.mutator.loans.reset();
    props.mutator.loans.GET();
    props.mutator.openRequests.reset();
    props.mutator.openRequests.GET(ChangeDueDateDialog.getOpenRequestsQuery(props));
  }

  static manifest = Object.freeze({
    loans: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=!{user.id} and status.name<>Closed)&limit=100000',
      throwErrors: false,
      accumulate: true,
      PUT: {
        path: 'circulation/loans/%{loanId}',
      },
    },
    openRequests: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      accumulate: true,
      params: {
        limit: '10000',
      },
    },
  });

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
      openRequests: PropTypes.shape({
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
      }),
      openRequests: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
            itemId: PropTypes.string,
            requestType: PropTypes.string,
          })
        )
      }),
    }).isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func
    }),
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
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
      ChangeDueDateDialog.fetchData(props);
      newState.open = true;
    }

    const loanIds = props.loanIds.map(l => l.id);
    if (isEqual(loanIds, state.loanIds) === false) {
      newState.loanIds = loanIds;
    }

    if (Object.keys(newState).length) return newState;

    return null;
  }

  getLoansAlerts() {
    const {
      succeeded,
      alerts,
    } = this.state;

    const loans = this.loans();
    const newAlerts = {};

    if (loans.length > 0 && !succeeded) {
      loans.forEach((loan) => {
        if (this.hasItemRecallRequests(loan.itemId)) {
          newAlerts[loan.id] = this.renderAlert(
            css.warn,
            'exclamation-circle',
            'warn',
            'stripes-smart-components.cddd.itemHasBeenRecalled'
          );
        }
        if (loan.item?.status?.name === 'Declared lost') {
          newAlerts[loan.id] = this.renderAlert(
            css.warn,
            'exclamation-circle',
            'warn',
            'stripes-smart-components.cddd.itemDeclaredLostWarning'
          );
        }
        if (loan.item?.status?.name === 'Claimed returned') {
          newAlerts[loan.id] = this.renderAlert(
            css.warn,
            'exclamation-circle',
            'warn',
            'stripes-smart-components.cddd.itemClaimedReturnedWarning'
          );
        }
        if (loan.item?.status?.name === 'Aged to lost') {
          newAlerts[loan.id] = this.renderAlert(
            css.warn,
            'exclamation-circle',
            'warn',
            'stripes-smart-components.cddd.itemAgedToLostWarning'
          );
        }
      });
    }

    return Object.assign(newAlerts, alerts);
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

    ChangeDueDateDialog.fetchData(this.props);
  }

  // The input changeResults is an array of the results from an attempt
  // to change the due date for an array of items/loans. Each entry will
  // be either a loan object (with new due date) if the operation succeeded
  // or a 422 response if the operation failed. The latter can be distinguished
  // by having the property ok: false.
  handleDueDateChanged(changeResults) {
    const alerts = {};
    let numSucceeded = 0;
    let numFailed = 0;

    const loans = this.loans();

    changeResults.forEach(result => {
      if (result.id) {
        // This is a loan object after a successful change
        alerts[result.id] = this.renderAlert(
          css.success,
          'check-circle',
          'success',
          'stripes-smart-components.cddd.changeSucceeded'
        );
        numSucceeded++;
      } else {
        // This date change attempt failed.
        const putEndpoint = '/circulation/loans/';
        const failedLoanId = result.url.split(putEndpoint)[1];

        const errorMessage = getErrorMessage(loans, failedLoanId);

        alerts[failedLoanId] = this.renderAlert(
          css.warn,
          'exclamation-circle',
          'failure',
          errorMessage
        );
        numFailed++;
      }
    });

    this.setState({
      succeeded: true,
      resultCounts: {
        numSucceeded,
        numFailed,
      },
      alerts,
    });

    ChangeDueDateDialog.fetchData(this.props);
  }

  renderAlert(className, icon, status, messageId) {
    return (
      <div className={className}>
        <Icon
          size="small"
          icon={icon}
          status={status}
        />
        <FormattedMessage id={messageId} />
      </div>
    );
  }

  hasItemRecallRequests(itemId) {
    const openRequests = get(this.props, 'resources.openRequests.records', []);
    const recallRequestType = 'Recall';

    return openRequests.some(openRequest => {
      return itemId === openRequest.itemId && openRequest.requestType === recallRequestType;
    });
  }

  loans() {
    const userLoans = get(this.props, 'resources.loans.records', []);

    return userLoans.filter(l => this.state.loanIds.includes(l.id));
  }

  getOpenRequestCounts() {
    const openRequests = get(this.props, 'resources.openRequests.records', []);

    const requestCounts = openRequests.reduce((requests, record) => {
      requests[record.itemId] = requests[record.itemId] ? requests[record.itemId] + 1 : 1;

      return requests;
    }, {});

    return requestCounts;
  }

  render() {
    const {
      succeeded,
      resultCounts,
    } = this.state;
    const { user, open, onClose, stripes } = this.props;

    const BodyComponent = succeeded ? ChangeDueDateSuccess : this.connectedChangeDueDate;
    const modalLabel = succeeded ?
      <FormattedMessage id="stripes-smart-components.cddd.changeDueDateConfirmation" /> :
      <FormattedMessage id="stripes-smart-components.cddd.changeDueDate" />;

    const alerts = this.getLoansAlerts();
    const loans = this.loans();

    return (
      <Modal
        data-test-change-due-date-dialog
        size="large"
        dismissible
        closeOnBackgroundClick
        enforceFocus={false} // Needed to allow Calendar in Datepicker to get focus
        onClose={onClose}
        open={open}
        label={modalLabel}
      >
        {
          isEmpty(loans) ?
            <Layout className="textCentered">
              <Spinner />
            </Layout> :
            <BodyComponent
              user={user}
              alerts={alerts}
              stripes={stripes}
              loans={loans}
              dueDatesChanged={resultCounts}
              onDueDateChanged={this.handleDueDateChanged}
              onCancel={this.handleCancel}
              requestCounts={this.getOpenRequestCounts()}
            />
        }
      </Modal>
    );
  }
}

export default ChangeDueDateDialog;

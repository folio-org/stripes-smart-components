import React from 'react';
import PropTypes from 'prop-types';
import { get, isEqual, pickBy } from 'lodash';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import Layout from '@folio/stripes-components/lib/Layout';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import DueDatePicker from './DueDatePicker';
import LoanList from '../LoanList';

class ChangeDueDate extends React.Component {
  static DEFAULT_TIME = '23:59:00.000Z';

  static checkForWarnings(props, state) {
    const warnings = [];

    if (ChangeDueDate.userWillBeExpired(props, state)) {
      warnings.push(<FormattedMessage id="stripes-smart-components.cddd.warning.dueDateAfterPatronExpiration" />);
    }

    if (ChangeDueDate.newDueDateIsInThePast(props, state)) {
      warnings.push(<FormattedMessage id="stripes-smart-components.cddd.warning.dueDateInPast" />);
    }

    return warnings;
  }

  static manifest = {
    user: {
      type: 'okapi',
      path: 'users/!{user.id}',
      throwErrors: false,
    },
    loanId: {},
    loan: {
      type: 'okapi',
      path: 'circulation/loans/%{loanId}',
      throwErrors: false,
      fetch: false,
      PUT: {
        path: 'circulation/loans/%{loanId}',
      },
    },
  }

  static newDueDateIsInThePast(props, state) {
    const requestedDueDate = moment(state.datetime);
    const currentDate = moment.tz('UTC');

    return requestedDueDate.isBefore(currentDate);
  }


  static userWillBeExpired(props, state) {
    const user = get(props, ['resources', 'user', 'records', 0]);

    if (!user || !user.expirationDate) return false;

    const requestedDueDate = moment(state.datetime);
    const userExpirationDate = moment(user.expirationDate);

    return userExpirationDate.isBefore(requestedDueDate);
  }

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func,
      intl: PropTypes.shape({
        formatMessage: PropTypes.func,
      }),
    }),
    mutator: PropTypes.shape({
      loan: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
      loanId: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    resources: PropTypes.shape({ // eslint-disable-line
      user: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            expirationDate: PropTypes.string,
          }),
        ),
      }),
    }).isRequired,
    alerts: PropTypes.object,
    loans: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        itemId: PropTypes.string,
        loanDate: PropTypes.string,
        dueDate: PropTypes.string,
      }),
    ),
    onCancel: PropTypes.func,
    onDueDateChanged: PropTypes.func,
    onDueDateChangeFailed: PropTypes.func,
    user: PropTypes.shape({ // eslint-disable-line
      id: PropTypes.string.isRequired,
    }).isRequired,
  }

  static contextTypes = {
    stripes: PropTypes.shape({
      formatDateTime: PropTypes.func.isRequired,
    }).isRequired,
  };


  static defaultProps = {
    loans: [],
  }


  constructor(props) {
    super(props);

    this.state = {
      datetime: '',
      loanSelection: {},
      warnings: [],
    };

    this.changeDueDate = this.changeDueDate.bind(this);
    this.handleDateTimeChanged = this.handleDateTimeChanged.bind(this);
    this.toggleLoanSelection = this.toggleLoanSelection.bind(this);
    this.toggleBulkLoanSelection = this.toggleBulkLoanSelection.bind(this);

    this.connectedLoanList = props.stripes.connect(LoanList);
  }


  static getDerivedStateFromProps(props, state) {
    const newState = {};

    if (props.loans.length !== Object.keys(state.loanSelection).length) {
      const loanSelection = {};
      props.loans.forEach(loan => { loanSelection[loan.id] = true; });

      newState.loanSelection = loanSelection;
    }

    const newWarnings = ChangeDueDate.checkForWarnings(props, state);
    if (isEqual(newWarnings, state.warnings) === false) {
      newState.warnings = newWarnings;
    }

    if (Object.keys(newState)) return newState;

    return null;
  }

  getLastDueDate() {
    const { loans } = this.props;

    const lastDueDate = loans.reduce((latestDate, loan) => {
      const loanDueDate = moment(loan.dueDate);
      return loanDueDate.isAfter(latestDate) ? loanDueDate : latestDate;
    }, moment(0));

    if (lastDueDate.isBefore(moment())) {
      return '';
    }

    return lastDueDate.format('YYYY-MM-DD');
  }

  getUpdatedLoans() {
    const { loanSelection, datetime } = this.state;
    const selectedLoanIds = Object.keys(pickBy(loanSelection, value => value));

    return this.props.loans
      .filter(loan => selectedLoanIds.includes(loan.id))
      .map(loan => ({
        ...loan,
        dueDate: datetime,
        action: 'dueDateChanged',
      }));
  }

  changeDueDate() {
    const loans = this.getUpdatedLoans();

    const promises = loans
      .map(loan => this.validateLoanChange(loan))
      .map(loan => this.performLoanChange(loan));

    Promise.all(promises)
      .then((results) => {
        this.props.onDueDateChanged(results);
      })
      .catch((error) => {
        const putEndpoint = '/circulation/loans/';

        if (error.url && error.url.indexOf(putEndpoint)) {
          const failedLoan = error.url.split(putEndpoint)[1];
          this.props.onDueDateChangeFailed({
            [failedLoan]: this.props.stripes.intl.formatMessage({ id: 'stripes-smart-components.cddd.changeFailed' })
          });
        } else {
          this.props.onDueDateChangeFailed(error);
        }
      });
  }

  handleDateTimeChanged(datetime) {
    this.setState({ datetime });
  }

  performLoanChange(loan) {
    if (!loan) return null;

    this.props.mutator.loanId.replace(loan.id);
    return this.props.mutator.loan.PUT(loan);
  }

  toggleBulkLoanSelection() {
    const loanSelection = {};

    const someLoansUnselected = Object.values(this.state.loanSelection).includes(false);
    Object.keys(this.state.loanSelection).forEach(key => { loanSelection[key] = someLoansUnselected; });

    this.setState({ loanSelection });
  }

  toggleLoanSelection(loan) {
    const { loanSelection } = this.state;

    this.setState({
      loanSelection: {
        ...loanSelection,
        [loan.id]: !(loanSelection[loan.id])
      }
    });
  }

  validateLoanChange(loan) {
    return loan;
  }

  render() {
    const { loans } = this.props;

    if (!loans.length) return null;

    return (
      <div>
        <p>
          { loans.length > 1 ?
            <SafeHTMLMessage
              id="stripes-smart-components.cddd.itemsSelected"
              values={{ count: loans.length }}
            /> : null
          }
          {this.state.warnings.map((warning, i) => (
            <span key={i} style={{ color: 'orange' }}>
              <Icon size="medium" icon="validation-error" color="orange" />
              {warning}
            </span>
          ))}
        </p>
        <DueDatePicker
          stripes={this.props.stripes}
          onChange={this.handleDateTimeChanged}
          initialValues={{
            date: this.getLastDueDate(),
            time: ChangeDueDate.DEFAULT_TIME,
          }}
          dateProps={{ label: 'Date*' }}
          timeProps={{ label: 'Time *' }}
        />
        <this.connectedLoanList
          stripes={this.props.stripes}
          alerts={this.props.alerts}
          loans={loans}
          loanSelection={this.state.loanSelection}
          onToggleLoanSelection={this.toggleLoanSelection}
          onToggleBulkLoanSelection={this.toggleBulkLoanSelection}
        />
        <Layout className="textRight">
          <Button onClick={this.props.onCancel}>
            <FormattedMessage id="stripes-core.button.cancel" />
          </Button>
          <Button
            buttonStyle="primary"
            onClick={this.changeDueDate}
            disabled={this.state.datetime === 'Invalid date' || Object.values(this.state.loanSelection).includes(true) === false}
          >
            <FormattedMessage id="stripes-core.button.saveAndClose" />
          </Button>
        </Layout>
      </div>
    );
  }
}

export default ChangeDueDate;

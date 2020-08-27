import React from 'react';
import PropTypes from 'prop-types';
import { get, isEqual, pickBy } from 'lodash';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import { Button, Icon, Layout } from '@folio/stripes-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import DueDatePicker from './DueDatePicker';
import LoanList from './LoanList';
import css from './ChangeDueDateDialog.css';
import { DueDateUnchangeableItemStatuses } from './constants';

class ChangeDueDate extends React.Component {
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

  static manifest = Object.freeze({
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
  });

  static DEFAULT_TIME = '23:59:00.000Z';

  static propTypes = {
    alerts: PropTypes.object,
    loans: PropTypes.arrayOf(
      PropTypes.shape({
        dueDate: PropTypes.string,
        id: PropTypes.string,
        itemId: PropTypes.string,
        loanDate: PropTypes.string,
      }),
    ),
    mutator: PropTypes.shape({
      loan: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
      loanId: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    onCancel: PropTypes.func,
    onDueDateChanged: PropTypes.func,
    requestCounts: PropTypes.object.isRequired,
    resources: PropTypes.shape({ // eslint-disable-line
      user: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            expirationDate: PropTypes.string,
          }),
        ),
      }),
    }).isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func
    }),
    user: PropTypes.shape({ // eslint-disable-line
      id: PropTypes.string.isRequired,
    }).isRequired,
  }

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
      // Adding a catch block to the individual loan promises
      // traps the errors that the server returns if there's an
      // 'unproccessable entity', e.g. because the item is declared
      // lost. This allows Promise.all to resolve *all* the promises
      // in the array without stopping at the first error.
      .map(loan => this.performLoanChange(loan).catch(e => e));

    Promise.all(promises)
      .then(results => this.props.onDueDateChanged(results));
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

  // Return true if the item associated with the given loan ID has status 'Declared lost',
  // 'Claimed returned', or 'Aged to lost'
  isItemDueDateUnchangeable = loanId => {
    const matchedLoan = this.props.loans.find(loan => loanId === loan.id);
    return DueDateUnchangeableItemStatuses.includes(matchedLoan?.item?.status?.name);
  }

  // Return true if the loans selected in the list are all for items declared lost or claimed returned
  // (this is used to disable the save button).
  //  checkboxLoanIds is an object of loan IDs as keys and
  //  boolean values corresponding to their selected (checked) status.
  onlyDueDateUnchangeableItems = checkboxLoanIds => {
    return Object.keys(checkboxLoanIds)
      // get an array of *selected* loan IDs
      .filter(id => checkboxLoanIds[id] === true)
      .every(id => this.isItemDueDateUnchangeable(id));
  }

  render() {
    const {
      loans,
      requestCounts,
    } = this.props;

    const {
      loanSelection,
      datetime,
      warnings,
    } = this.state;

    if (!loans.length) return null;

    // Determine whether the save button should be disabled
    const shouldDisableSave =
      // Disable save if the date is invalid ...
      datetime === 'Invalid date' ||
      // ... or none of the loans are selected/checked ...
      !Object.values(loanSelection).includes(true) ||
      // ... or the checked loans are all associated with items declared lost or claimed returned
      this.onlyDueDateUnchangeableItems(loanSelection);

    const numSelectedLoans = Object.values(loanSelection).filter(Boolean).length;

    return (
      <div>
        <p role="alert">
          { loans.length > 1 ?
            <SafeHTMLMessage
              id="stripes-smart-components.cddd.itemsSelected"
              values={{ count: numSelectedLoans }}
            /> : null
          }
          {warnings.map((warning, i) => (
            <span key={i} className={css.warn}>
              <Icon size="medium" icon="exclamation-circle" status="warn" />
              {warning}
            </span>
          ))}
        </p>
        <DueDatePicker
          stripes={this.props.stripes}
          onChange={this.handleDateTimeChanged}
          initialValues={{
            date: '',
            time: ChangeDueDate.DEFAULT_TIME,
          }}
          dateProps={{ label: <FormattedMessage id="stripes-smart-components.cddd.date" /> }}
          timeProps={{ label: <FormattedMessage id="stripes-smart-components.cddd.time" /> }}
        />
        <this.connectedLoanList
          stripes={this.props.stripes}
          alerts={this.props.alerts}
          loans={loans}
          requestCounts={requestCounts}
          loanSelection={loanSelection}
          onToggleLoanSelection={this.toggleLoanSelection}
          onToggleBulkLoanSelection={this.toggleBulkLoanSelection}
        />
        <Layout className="textRight">
          <Button
            data-test-change-due-date-cancel-button
            onClick={this.props.onCancel}
          >
            <FormattedMessage id="stripes-core.button.cancel" />
          </Button>
          <Button
            data-test-change-due-date-save-button
            buttonStyle="primary"
            onClick={this.changeDueDate}
            disabled={shouldDisableSave}
          >
            <FormattedMessage id="stripes-core.button.saveAndClose" />
          </Button>
        </Layout>
      </div>
    );
  }
}

export default ChangeDueDate;

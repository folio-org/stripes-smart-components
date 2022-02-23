import React from 'react';
import PropTypes from 'prop-types';
import { get, kebabCase } from 'lodash';
import { FormattedMessage, FormattedTime, useIntl } from 'react-intl';
import { Checkbox, MultiColumnList } from '@folio/stripes-components';
import getEffectiveCallNumber from '@folio/stripes-util/lib/effectiveCallNumber';

const propTypes = {
  alerts: PropTypes.object,
  allowSelection: PropTypes.bool,
  height: PropTypes.number,
  loans: PropTypes.arrayOf(
    PropTypes.shape({
      dueDate: PropTypes.string,
      id: PropTypes.string,
      itemId: PropTypes.string,
      loanDate: PropTypes.string,
    }),
  ),
  loanSelection: PropTypes.object,
  onToggleBulkLoanSelection: PropTypes.func,
  onToggleLoanSelection: PropTypes.func,
  requestCounts: PropTypes.object,
  resources: PropTypes.shape({
    loanPolicies: PropTypes.object,
  })
};

const defaultProps = {
  allowSelection: true,
  height: 400,
  loans: [],
  loanSelection: {},
  requestCounts: {},
};

const manifest = Object.freeze({
  loanPolicies: {
    type: 'okapi',
    path: 'loan-policy-storage/loan-policies',
    params: {
      limit: '1000',
    },
  },
});

const LoanList = (props) => {
  const intl = useIntl();

  const {
    loanSelection,
    onToggleLoanSelection,
    requestCounts,
    loans,
  } = props;

  const visibleColumns = [
    'loanListAlertDetails',
    'loanListTitle',
    'loanListItemStatus',
    'loanListCurrentDueDate',
    'loanListRequests',
    'loanListBarcode',
    'loanListEffectiveCallNumber',
    'loanListLoanPolicy',
  ];

  if (props.allowSelection) visibleColumns.unshift('selected');

  const rowUpdater = (rowData) => requestCounts[rowData.itemId];

  const setCheckboxLabel = (id) => {
    const currentLoan = loans.find(loan => loan.id === id).item;

    return `checkbox-${kebabCase(currentLoan.title)}-${currentLoan.barcode}`;
  };

  return (
    <MultiColumnList
      interactive={false}
      height={props.height}
      contentData={props.loans}
      visibleColumns={visibleColumns}
      rowUpdater={rowUpdater}
      columnMapping={{
        selected: <Checkbox
          name="selected-all"
          aria-label={intl.formatMessage({ id: 'stripes-smart-components.cddd.selectAll' })}
          checked={Object.values(loanSelection).includes(false) !== true}
          onChange={props.onToggleBulkLoanSelection}
        />,
        loanListAlertDetails: <FormattedMessage id="stripes-smart-components.cddd.header.alertDetails" />,
        loanListTitle: <FormattedMessage id="stripes-smart-components.cddd.header.title" />,
        loanListItemStatus: <FormattedMessage id="stripes-smart-components.cddd.header.itemStatus" />,
        loanListCurrentDueDate: <FormattedMessage id="stripes-smart-components.cddd.header.currentDueDate" />,
        loanListRequests: <FormattedMessage id="stripes-smart-components.cddd.header.requests" />,
        loanListBarcode: <FormattedMessage id="stripes-smart-components.cddd.header.barcode" />,
        loanListEffectiveCallNumber: <FormattedMessage id="stripes-smart-components.cddd.header.effectiveCallNumber" />,
        loanListLoanPolicy: <FormattedMessage id="stripes-smart-components.cddd.header.loanPolicy" />
      }}
      formatter={{
        selected: loan => <Checkbox
          name={`selected-${loan.id}`}
          aria-label={setCheckboxLabel(loan.id)}
          checked={!!(loanSelection[loan.id])}
          onChange={() => onToggleLoanSelection(loan)}
        />,
        loanListAlertDetails: loan => props.alerts[loan.id] || '',
        loanListTitle: loan => get(loan, ['item', 'title']),
        loanListItemStatus: loan => get(loan, ['item', 'status', 'name']),
        loanListCurrentDueDate:
          loan => <FormattedTime value={get(loan, ['dueDate'])} day="numeric" month="numeric" year="numeric" />,
        loanListRequests: loan => (<div data-test-requests-count>{ requestCounts[loan.itemId] || 0 }</div>),
        loanListBarcode: loan => get(loan, ['item', 'barcode']),
        loanListEffectiveCallNumber: loan => getEffectiveCallNumber(loan),
        loanListLoanPolicy: loan => {
          const policies = get(props, ['resources', 'loanPolicies', 'records', 0, 'loanPolicies'], []);
          const policy = policies.find(p => p.id === loan.loanPolicyId) || {};
          return policy.name;
        },
      }}
      columnWidths={{
        loanListAlertDetails: 120,
        loanListCurrentDueDate: 150,
        loanListEffectiveCallNumber: 120,
        loanListLoanPolicy: 120,
        loanListRequests: 100,
        loanListTitle: 170,
        selected: 40,
      }}
    />
  );
};

LoanList.defaultProps = defaultProps;
LoanList.propTypes = propTypes;
LoanList.manifest = manifest;

export default LoanList;

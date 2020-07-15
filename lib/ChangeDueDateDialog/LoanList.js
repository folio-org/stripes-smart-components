import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage, FormattedTime } from 'react-intl';
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
  const {
    loanSelection,
    onToggleLoanSelection,
    requestCounts,
  } = props;

  const visibleColumns = [
    'alertDetails',
    'title',
    'itemStatus',
    'currentDueDate',
    'requests',
    'barcode',
    'effectiveCallNumber',
    'loanPolicy',
  ];

  if (props.allowSelection) visibleColumns.unshift('selected');

  const rowUpdater = (rowData) => requestCounts[rowData.itemId];

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
          checked={Object.values(loanSelection).includes(false) !== true}
          onChange={props.onToggleBulkLoanSelection}
        />,
        alertDetails: <FormattedMessage id="stripes-smart-components.cddd.header.alertDetails" />,
        title: <FormattedMessage id="stripes-smart-components.cddd.header.title" />,
        itemStatus: <FormattedMessage id="stripes-smart-components.cddd.header.itemStatus" />,
        currentDueDate: <FormattedMessage id="stripes-smart-components.cddd.header.currentDueDate" />,
        requests: <FormattedMessage id="stripes-smart-components.cddd.header.requests" />,
        barcode: <FormattedMessage id="stripes-smart-components.cddd.header.barcode" />,
        effectiveCallNumber: <FormattedMessage id="stripes-smart-components.cddd.header.effectiveCallNumber" />,
        loanPolicy: <FormattedMessage id="stripes-smart-components.cddd.header.loanPolicy" />
      }}
      formatter={{
        selected: loan => <Checkbox
          name={`selected-${loan.id}`}
          checked={!!(loanSelection[loan.id])}
          onChange={() => onToggleLoanSelection(loan)}
        />,
        alertDetails: loan => props.alerts[loan.id] || '',
        title: loan => get(loan, ['item', 'title']),
        itemStatus: loan => get(loan, ['item', 'status', 'name']),
        currentDueDate:
          loan => <FormattedTime value={get(loan, ['dueDate'])} day="numeric" month="numeric" year="numeric" />,
        requests: loan => (<div data-test-requests-count>{ requestCounts[loan.itemId] || 0 }</div>),
        barcode: loan => get(loan, ['item', 'barcode']),
        effectiveCallNumber: loan => getEffectiveCallNumber(loan),
        loanPolicy: loan => {
          const policies = get(props, ['resources', 'loanPolicies', 'records', 0, 'loanPolicies'], []);
          const policy = policies.find(p => p.id === loan.loanPolicyId) || {};
          return policy.name;
        },
      }}
      columnWidths={{
        alertDetails: 120,
        selected: 40,
      }}
    />
  );
};

LoanList.defaultProps = defaultProps;
LoanList.propTypes = propTypes;
LoanList.manifest = manifest;

export default LoanList;

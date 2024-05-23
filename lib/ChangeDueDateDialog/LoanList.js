import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
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

const manifest = Object.freeze({
  loanPolicies: {
    type: 'okapi',
    path: 'loan-policy-storage/loan-policies',
    params: {
      limit: '1000',
    },
  },
});

const LoanList = ({
  alerts,
  allowSelection = true,
  height = 400,
  loans = [],
  loanSelection = {},
  onToggleBulkLoanSelection,
  onToggleLoanSelection,
  requestCounts = {},
  resources,
}) => {
  const { formatMessage } = useIntl();

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

  if (allowSelection) visibleColumns.unshift('selected');

  const rowUpdater = (rowData) => requestCounts[rowData.itemId];

  return (
    <MultiColumnList
      interactive={false}
      height={height}
      contentData={loans}
      visibleColumns={visibleColumns}
      rowUpdater={rowUpdater}
      columnMapping={{
        selected: <Checkbox
          name="selected-all"
          checked={Object.values(loanSelection).includes(false) !== true}
          onChange={onToggleBulkLoanSelection}
          aria-label={formatMessage({ id: 'stripes-smart-components.cddd.selectAllLoans' })}
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
          checked={!!(loanSelection[loan.id])}
          onChange={() => onToggleLoanSelection(loan)}
          aria-label={formatMessage(
            { id: 'stripes-smart-components.cddd.selectLoan' },
            { loanName: get(loan, ['item', 'title']) }
          )}
        />,
        loanListAlertDetails: loan => alerts[loan.id] || '',
        loanListTitle: loan => get(loan, ['item', 'title']),
        loanListItemStatus: loan => get(loan, ['item', 'status', 'name']),
        loanListCurrentDueDate:
          loan => <FormattedTime value={get(loan, ['dueDate'])} day="numeric" month="numeric" year="numeric" />,
        loanListRequests: loan => (<div data-test-requests-count>{ requestCounts[loan.itemId] || 0 }</div>),
        loanListBarcode: loan => get(loan, ['item', 'barcode']),
        loanListEffectiveCallNumber: loan => getEffectiveCallNumber(loan),
        loanListLoanPolicy: loan => {
          const policies = get(resources, ['loanPolicies', 'records', 0, 'loanPolicies'], []);
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

LoanList.propTypes = propTypes;
LoanList.manifest = manifest;

export default LoanList;

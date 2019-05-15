import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage, FormattedTime } from 'react-intl';
import { Checkbox, MultiColumnList } from '@folio/stripes-components';

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
  resources: PropTypes.shape({
    loanPolicies: PropTypes.object,
  })
};

const defaultProps = {
  allowSelection: true,
  height: 400,
  loans: [],
  loanSelection: {},
};

const manifest = {
  loanPolicies: {
    type: 'okapi',
    path: 'loan-policy-storage/loan-policies',
  },
};

const LoanList = (props) => {
  const { loanSelection, onToggleLoanSelection } = props;

  const visibleColumns = [
    'alertDetails',
    'title',
    'itemStatus',
    'currentDueDate',
    'requestQueue',
    'barcode',
    'callNumber',
    'loanPolicy',
  ];

  if (props.allowSelection) visibleColumns.unshift('selected');

  return (
    <MultiColumnList
      interactive={false}
      height={props.height}
      contentData={props.loans}
      visibleColumns={visibleColumns}
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
        requestQueue: <FormattedMessage id="stripes-smart-components.cddd.header.requestQueue" />,
        barcode: <FormattedMessage id="stripes-smart-components.cddd.header.barcode" />,
        callNumber: <FormattedMessage id="stripes-smart-components.cddd.header.callNumber" />,
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
        requestQueue: () => 'N/A',
        barcode: loan => get(loan, ['item', 'barcode']),
        callNumber: loan => get(loan, ['item', 'callNumber']),
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

import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import Checkbox from '@folio/stripes-components/lib/Checkbox';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';

const propTypes = {
  stripes: PropTypes.shape({
    formatDateTime: PropTypes.func.isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }),
  }),
  alerts: PropTypes.object,
  allowSelection: PropTypes.bool,
  height: PropTypes.number,
  loans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      itemId: PropTypes.string,
      loanDate: PropTypes.string,
      dueDate: PropTypes.string,
    }),
  ),
  loanSelection: PropTypes.object,
  resources: PropTypes.shape({ // eslint-disable-line
    loanPolicies: PropTypes.object,
  }),
  onToggleLoanSelection: PropTypes.func,
  onToggleBulkLoanSelection: PropTypes.func,
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
  const { formatMessage } = props.stripes.intl;
  const { stripes, loanSelection, onToggleLoanSelection } = props;

  const visibleColumns = [
    'alertDetails',
    'title',
    'itemStatus',
    'currentDueDate',
    // 'requestQueue',
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
        alertDetails: formatMessage({ id: 'stripes-smart-components.cddd.header.alertDetails' }),
        title: formatMessage({ id: 'stripes-smart-components.cddd.header.title' }),
        itemStatus: formatMessage({ id: 'stripes-smart-components.cddd.header.itemStatus' }),
        currentDueDate: formatMessage({ id: 'stripes-smart-components.cddd.header.currentDueDate' }),
        // requestQueue: formatMessage({ id: 'stripes-smart-components.cddd.header.requestQueue' }),
        barcode: formatMessage({ id: 'stripes-smart-components.cddd.header.barcode' }),
        callNumber: formatMessage({ id: 'stripes-smart-components.cddd.header.callNumber' }),
        loanPolicy: formatMessage({ id: 'stripes-smart-components.cddd.header.loanPolicy' }),
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
        currentDueDate: loan => stripes.formatDateTime(get(loan, ['dueDate'])),
        // requestQueue: loan => get(loan, ['item', 'requestQueue'], 'N/A'),
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

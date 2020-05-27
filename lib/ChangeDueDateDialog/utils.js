// Return true if the item associated with the given loan ID has specified status
export function hasLoanItemStatus(loans, loanId, itemStatus) {
  const matchedLoan = loans.find(loan => loanId === loan.id);
  return matchedLoan?.item?.status?.name === itemStatus;
}

// Return a specific error message for items declared lost, for items claimed returned,
// and a fallback message for all other failures.
export default function getErrorMessage(loans, loanId) {
  if (hasLoanItemStatus(loans, loanId, 'Declared lost')) {
    return 'stripes-smart-components.cddd.itemDeclaredLost';
  }
  if (hasLoanItemStatus(loans, loanId, 'Claimed returned')) {
    return 'stripes-smart-components.cddd.itemClaimedReturned';
  }
  return 'stripes-smart-components.cddd.changeFailed';
}

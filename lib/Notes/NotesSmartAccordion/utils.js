import {
  notesStatuses,
} from '../constants';

// eslint-disable-next-line import/prefer-default-export
export const getQueryParams = ({ sortParams, selectedStatusFilters, query = '', limit }) => {
  const queryParams = {
    status: notesStatuses.ALL,
    limit,
    orderBy: sortParams.by,
    order: sortParams.order,
  };

  if (selectedStatusFilters.length === 1) {
    queryParams.status = selectedStatusFilters[0];
  }

  if (query.length > 0) {
    queryParams.title = query;
  }

  return queryParams;
};

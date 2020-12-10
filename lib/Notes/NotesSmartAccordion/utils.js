import {
  notesStatuses,
} from '../constants';

/**
 * Helper for creating a string with query params.
 * @param {Object} sortParams - contains orderBy and order properties.
 * orderBy includes field name
 * order includes asc or desc string value
 * @param {Array} selectedStatusFilters - array of active note status(assigned/unassigned) filters
 * @param {Array} selectedNoteTypeFilters - array of active note type filters
 * @param {String} query - search query
 * @param {String} limit - maximum amount of resources
 */
// eslint-disable-next-line import/prefer-default-export
export const getSearchParamsString = params => {
  const {
    sortParams,
    selectedStatusFilters,
    selectedNoteTypeFilters,
    query = '',
    limit,
  } = params;

  const searchParams = new URLSearchParams();

  searchParams.append('status', notesStatuses.ALL);
  searchParams.append('limit', limit);
  searchParams.append('orderBy', sortParams.by);
  searchParams.append('order', sortParams.order);

  if (selectedStatusFilters.length === 1) {
    searchParams.set('status', selectedStatusFilters[0]);
  }

  if (selectedNoteTypeFilters.length > 0) {
    selectedNoteTypeFilters.forEach((filter) => {
      searchParams.append('noteType', filter);
    });
  }

  if (query.length > 0) {
    searchParams.append('search', query);
  }

  return searchParams.toString();
};


import {
  STATUS_FILTERS_NUMBER,
  notesStatuses,
} from '../constants';

// eslint-disable-next-line import/prefer-default-export
export const makeSearchQuery = ({ sortParams, domainName, entity, selectedStatusFilters, query }) => {
  const sortQuery = ` sortBy ${sortParams.by}/sort.${sortParams.order}`;
  let searchQuery = `domain=${domainName} and title="${query}*"`;
  const onlyOneOfTheStatusFiltersIsSelected = selectedStatusFilters.length > 0
    && selectedStatusFilters.length !== STATUS_FILTERS_NUMBER;

  if (onlyOneOfTheStatusFiltersIsSelected) {
    searchQuery += selectedStatusFilters.reduce((string, status) => {
      let assignmentStatusQueryString = string;
      const assignmentStatusQuery = `linkTypes=${entity.type} and linkIds=/respectCase/respectAccents ${entity.id}`;

      if (status === notesStatuses.ASSIGNED) {
        assignmentStatusQueryString += ` and ${assignmentStatusQuery}`;
      } else {
        assignmentStatusQueryString += ` NOT (${assignmentStatusQuery})`;
      }

      return `${assignmentStatusQueryString}`;
    }, '');
  }

  searchQuery += sortQuery;

  return searchQuery;
};

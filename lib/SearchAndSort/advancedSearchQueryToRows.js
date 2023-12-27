import {
  ADVANCED_SEARCH_MATCH_OPTIONS,
  ADVANCED_SEARCH_DEFAULT_SEARCH_OPTION,
} from '@folio/stripes-components';

const advancedSearchQueryToRows = (queryValue) => {
  if (!queryValue) {
    return [];
  }

  const splitIntoRowsRegex = /(?=\sor\s|\sand\s|\snot\s)/g;

  // split will return array of strings:
  // ['keyword==test', 'or issn=123', ...]
  const matches = queryValue.split(splitIntoRowsRegex).map(i => i.trim());

  return matches.map((match, index) => {
    let bool = '';
    let query = match;

    // first row doesn't have a bool operator
    if (index !== 0) {
      bool = match.substr(0, match.indexOf(' '));
      query = match.substr(bool.length).trim();
    }

    const matchOperatorStartIndex = query.indexOf(' ') + 1;
    const matchOperatorEndIndex = query.substr(matchOperatorStartIndex).indexOf(' ') + matchOperatorStartIndex + 1;

    const option = query.substr(0, matchOperatorStartIndex).trim().replaceAll('"', '');
    const _match = query.substring(matchOperatorStartIndex, matchOperatorEndIndex).trim().replaceAll('"', '');
    const value = query.substring(matchOperatorEndIndex).trim().replaceAll('"', '');

    return {
      query: value,
      bool,
      searchOption: option || ADVANCED_SEARCH_DEFAULT_SEARCH_OPTION,
      match: _match || ADVANCED_SEARCH_MATCH_OPTIONS.CONTAINS_ALL,
    };
  });
};

export default advancedSearchQueryToRows;

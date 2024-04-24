import {
  BOOLEAN_OPERATORS,
  DEFAULT_SEARCH_OPTION,
  MATCH_OPTIONS,
} from '@folio/stripes-components/lib/AdvancedSearch';

const advancedSearchQueryToRows = (queryValue) => {
  if (!queryValue) {
    return [];
  }

  /*
    Algorithm for parsing string into rows is as follows:
    1. We split the string into an arry of tokens, using space as a delimiter
    2. With a window of size 3 we iterate over the array and see if the window is over a specific part of a query string that represents a beginning of a new row
      Size 3 is chosen because a new row starts with 3 special tokens: a boolean condition, a search option and a match parameter.
    3. If a first token is a boolean token (and/or/not) and a third token is a match parameter (exactPhrase/startsWith/etc...)
      we consider it a beginning of a new row and add it to array of rows.
      Ideally we also need to check that a second token is a search option, but it needs to be passed by each application specifically because different apps
      have different search options. That would make it a breaking change so for now we only use boolean and match option
    4. If we added a new row - move the window by 3 tokens (the actual implementation inside `if` we increment by 2, but that is because we increment by 1 after each iteration which would be 3 in total).
      We need to move by 3 because if we only moved by 1 or 2 the condition would fail and we would add special tokens to query value
    5. If we didn't add a new row - then we add first token to the last added row's query
    6. Move the windows by 1 and repeat
  */

  const tokens = queryValue.replace(/\s+/g, ' ').split(' ');

  const rows = [];
  for (let index = 0; index <= tokens.length;) {
    const token1 = tokens[index - 1];
    const token2 = tokens[index];
    const token3 = tokens[index + 1];

    const isFirstTokenBoolean = Object.values(BOOLEAN_OPERATORS).includes(token1);
    const isThirdTokenMatch = Object.values(MATCH_OPTIONS).includes(token3);

    if ((isFirstTokenBoolean || !token1) && isThirdTokenMatch) {
      rows.push({
        bool: token1 || '',
        searchOption: token2,
        match: token3,
        query: '',
      });

      index += 2;
    } else if (rows[rows.length - 1]) {
      rows[rows.length - 1].query += `${token1} `;
    }
    index += 1;
  }

  if (!rows.length) {
    rows.push({
      query: queryValue,
      bool: '',
      searchOption: DEFAULT_SEARCH_OPTION,
      match: MATCH_OPTIONS.CONTAINS_ALL,
    });
  }

  rows.forEach(row => { row.query = row.query.trim(); });

  return rows;
};

export default advancedSearchQueryToRows;

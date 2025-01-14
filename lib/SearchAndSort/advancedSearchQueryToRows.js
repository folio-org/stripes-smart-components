import {
  BOOLEAN_OPERATORS,
  DEFAULT_SEARCH_OPTION,
  MATCH_OPTIONS,
} from '@folio/stripes-components';

const advancedSearchQueryToRows = (queryValue) => {
  if (!queryValue) {
    return [];
  }

  /*
    High-level explanation of the algorithm:
      We use two arrays of tokens: for first one we remove repeated spaces inside the string and split it using space as a delimiter
      The second array is also split by space, but we don't remove repeated spaces.

      We need two arrays because with repeated spaces we can't use a window (explained later) with size 3 to parse the structure of the query:
      For example string "keyword   containsAll value" without removing repeated spaces would give ["keyword", "", "", "containsAll", "value"].
      We can't use the window to go over the array and parse it because there could be however many spaces between "keyword" and "containsAll".

      Since we've removed repeated spaces in the first array we've also removed repeated spaces inside actual searched values
      and we need to restore them
      That's the job of the second array. It doesn't give us any information about the structure of the string - we just use it to
      know where we have removed spaces.
  */

  const tokenTypes = {
    BOOLEAN: 'bool',
    MATCH: 'match',
    SEARCH: 'searchOption',
    QUERY: 'query',
  };

  const generateNewRow = () => {
    return {
      query: '',
      bool: '',
      searchOption: DEFAULT_SEARCH_OPTION,
      match: MATCH_OPTIONS.CONTAINS_ALL,
    };
  };

  const rows = [generateNewRow()];

  //  1. Remove repeated spaces in the string and split it into an arry of tokens, using space as a delimiter.
  const tokens = queryValue.trim().replace(/\s+/g, ' ').split(' ').map(token => ({
    value: token,
    type: null,
  }));

  // 2. With a window of size 3 we iterate over the array and see if the window is over a specific part of a query string
  // that represents a beginning of a new row
  // Size 3 is chosen because a new row starts with 3 special tokens: a boolean condition, a search option and a match parameter.
  for (let index = 0; index <= tokens.length;) {
    const token1 = tokens[index - 1]?.value;
    const token3 = tokens[index + 1]?.value;

    const isFirstTokenBoolean = Object.values(BOOLEAN_OPERATORS).includes(token1);
    const isThirdTokenMatch = Object.values(MATCH_OPTIONS).includes(token3);

    if ((isFirstTokenBoolean || !token1) && isThirdTokenMatch) {
      /*
        2.1. If a first token is a boolean token (and/or/not) and a third token is a match parameter (exactPhrase/startsWith/etc...)
        we mark these three tokens with their types: `boolean`, `search` and `match`
        Ideally we also need to check that a second token is a search option, but it needs to be passed by each application specifically because different apps
        have different search options. That would make it a breaking change so for now we only use boolean and match option
      */
      if (tokens[index - 1]) {
        tokens[index - 1].type = tokenTypes.BOOLEAN;
      }

      tokens[index].type = tokenTypes.SEARCH;
      tokens[index + 1].type = tokenTypes.MATCH;

      /*
        2.2. If we encountered a beginning of a new row (token1 and token3 are boolean and match accordingly) - move the window by 3 tokens
        (the actual implementation inside `if` we increment by 2, but that is because we increment by 1 after each iteration which would be 3 in total).
        We need to move by 3 because if we only moved by 1 or 2 the condition would fail and we would add special tokens to query value
      */
      index += 2;
    } else if (tokens[index - 1]) {
      // 2.3. If we didn't encounter a new row - then we mark the first token as a query token
      tokens[index - 1].type = tokenTypes.QUERY;
    }

    // 2.4. Move the windows by 1 and repeat until all tokens are parsed
    index += 1;
  }

  /*
    For a string "keyword containsAll some   value" after step 2.4 we'll have an array like:
      [
        { type: 'searchOption', value: 'keyword' }
        { type: 'match', value: 'containsAll' }
        { type: 'query', value: 'some' }
        { type: 'query', value: 'value' }
      ]

    After this we move to the second part of the algorithm - restore repeated spaces in queries.
  */

  /*
    3. Generate `tokensWithSpaces` - array of tokens with repeated spaces.
    Example: "keyword  containsAll some   value" -> ["keyword", "", "containsAll", "some", "", "", "value"]
 */
  const tokensWithSpaces = queryValue.trim().split(' ');

  // 4. Iterate over `tokens` array and compare elements from `tokens` and `tokensWithSpaces`
  for (let index = 0, indexWithSpaces = 0; index < tokens.length; indexWithSpaces++) {
    const token = tokens[index];
    const tokenWithSpaces = tokensWithSpaces[indexWithSpaces];

    if (token.value === tokenWithSpaces) {
      // 4.1. If both tokens are equal - just increment iterators for both arrays, nothing else needs to be done
      index++;
    } else if (token.type === tokenTypes.QUERY) {
      /*
        4.2. If tokens are not equal and current token is of type query - insert a new item to `tokens` array after the current typed token
        and increment iterators for both arrays
      */
      tokens.splice(index, 0, {
        value: tokenWithSpaces,
        type: tokenTypes.QUERY,
      });
      index++;
    }

    // 4.3. If tokens are not equal - just increment iterator for tokens with spaces (done in the for loop declaration)
  }

  /*
    After this step `tokens` array will contain new elements with spaces:
      [
        { type: 'searchOption', value: 'keyword' }
        { type: 'match', value: 'containsAll' }
        { type: 'query', value: 'some' }
        { type: 'query', value: '' }
        { type: 'query', value: '' }
        { type: 'query', value: 'value' }
      ]

    The last part of the algorithm is to fill `rows` array based on `tokens` array.
  */


  // 5. Iterate over `tokens` array

  tokens.forEach((token) => {
    // 5.1. If a token is of type boolean - insert a new row

    if (token.type === tokenTypes.BOOLEAN) {
      rows.push(generateNewRow());
    }

    if (token.type === tokenTypes.QUERY) {
      // 5.2. If a token is of type query - append it's value to last row in the array
      rows[rows.length - 1][token.type] += ` ${token.value}`;
    } else {
      // 5.3. If a token is of any other type - save it's value to corresponding property
      rows[rows.length - 1][token.type] = token.value;
    }
  });

  // After that we just need to trim all row's query values and we're done

  rows.forEach(row => {
    row.query = row.query.trim();
  });

  return rows;
};

export default advancedSearchQueryToRows;

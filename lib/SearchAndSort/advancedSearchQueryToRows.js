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
      query = match.substr(bool.length);
    }

    const splitIndexAndQueryRegex = /([^=]+)(exactPhrase|containsAll|startsWith|containsAny)(.+)/g;

    const rowParts = [...query.matchAll(splitIndexAndQueryRegex)]?.[0] || [];
    // eslint-disable-next-line no-unused-vars
    const [, option, _match, value] = rowParts
      .map(i => i.trim())
      .map(i => i.replaceAll('"', ''));

    return {
      query: value,
      bool,
      searchOption: option,
      match: _match,
    };
  });
};

export default advancedSearchQueryToRows;

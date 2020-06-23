import queryString from 'query-string';
import {
  unset,
  isEmpty,
  forOwn,
} from 'lodash';

function getLocationQuery(location) {
  return location.query ? location.query : queryString.parse(location.search);
}

function removeEmpty(obj) {
  const cleanObj = {};

  forOwn(obj, (value, key) => {
    if (value) cleanObj[key] = value;
  });

  return cleanObj;
}

export default function buildUrl(location, values, basePath) {
  const locationQuery = getLocationQuery(location);
  let url = values._path || basePath || location.pathname;
  const params = removeEmpty(Object.assign(locationQuery, values));

  unset(params, '_path');

  if (!isEmpty(params)) {
    url += `?${queryString.stringify(params)}`;
  }

  return url;
}

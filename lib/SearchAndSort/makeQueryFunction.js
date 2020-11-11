import { compilePathTemplate } from '@folio/stripes-connect/RESTResource/RESTResource';
import { filters2cql } from '@folio/stripes-components/lib/FilterGroups';
import escapeCqlValue from '@folio/stripes-util/lib/escapeCqlValue';
import { get } from 'lodash';

import { removeNsKeys } from './nsQueryFunctions';

// return a function that returns a string, or null, which stripes-connect
// will use to construct a resource query. it will accept four params:
//
//     * An object containing the UI URL's query parameters (as accessed by ?{name}).
//     * An object containing the UI URL's path components (as accessed by :{name}).
//     * An object containing the component's resources' data (as accessed by %{name}).
//     * A logger object.
//
// @findAll string: CQL query to retrieve all records when there is a sort-clause but no CQL query
// @queryTemplate string|function: CQL query to interpolate or function which will return CQL as a string
// @sortMap object: map from sort-keys to the CQL fields they match
// @filterConfig array: list of filter objects with keys label, name, cql, values
// @failOnCondition int:
//      0: do not fail even if query and filters and empty
//      1: fail if query is empty, whatever the filter state
//      2: fail if both query and filters and empty.
//     For compatibility, false and true may be used for 0 and 1 respectively.
// @nsParams object|string: namespace keys
// @escape boolean whether to escape quote and backslash values in the query (default: true)
function makeQueryFunction(findAll, queryTemplate, sortMap, filterConfig, failOnCondition, nsParams, escape = true) {
  return (queryParams, pathComponents, resourceValues, logger) => {
    const resourceQuery = removeNsKeys(resourceValues.query, nsParams);
    const nsQueryParams = removeNsKeys(queryParams, nsParams);
    const { qindex, filters, query, sort } = resourceQuery || {};

    if ((query === undefined || query === '') &&
        (failOnCondition === 1 || failOnCondition === true)) {
      return null;
    }
    if ((query === undefined || query === '') &&
        (filters === undefined || filters === '') &&
        (failOnCondition === 2)) {
      return null;
    }

    const escapeFx = escape ? escapeCqlValue : (s) => (s);

    let cql;
    if (query && qindex) {
      const t = qindex.split('/', 2);
      if (t.length === 1) {
        cql = `${qindex}="${escapeFx(query)}*"`;
      } else {
        cql = `${t[0]} =/${t[1]} "${escapeFx(query)}*"`;
      }
    } else if (query) {
      const escapedQuery = { ...resourceQuery, ...{ query: escapeFx(get(resourceQuery, 'query', '')) } };
      cql = (typeof queryTemplate === 'function')
        ? queryTemplate(nsQueryParams, pathComponents, { query: escapedQuery })
        : compilePathTemplate(queryTemplate, nsQueryParams, pathComponents, { query: escapedQuery });

      if (cql === null) {
        // Some part of the template requires something that we don't have.
        return null;
      }
    }


    const filterCql = filters2cql(filterConfig, filters);
    if (filterCql) {
      if (cql) {
        cql = `(${cql}) and ${filterCql}`;
      } else {
        cql = filterCql;
      }
    }

    if (sort) {
      const sortIndexes = sort.split(',').map((sort1) => {
        let reverse = false;
        if (sort1.startsWith('-')) {
          sort1 = sort1.substr(1); // eslint-disable-line no-param-reassign
          reverse = true;
        }
        let sortIndex = sortMap[sort1] || sort1;
        if (reverse) {
          sortIndex = sortIndex.replace(' ', '/sort.descending ') + '/sort.descending';
        }
        return sortIndex;
      });

      if (cql === undefined) cql = findAll;
      cql = `(${cql}) sortby ${sortIndexes.join(' ')}`;
    }

    logger.log('mquery', `query='${query}' filters='${filters}' sort='${sort}' -> ${cql}`);

    return cql;
  };
}

export default makeQueryFunction;

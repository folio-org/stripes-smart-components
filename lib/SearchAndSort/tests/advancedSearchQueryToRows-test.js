import React from 'react';
import {
  describe,
  it,
} from 'mocha';
import { expect } from 'chai';

import advancedSearchQueryToRows from '../advancedSearchQueryToRows';

describe('advancedSearchQueryToRows', () => {
  describe('when query contains multiple rows', () => {
    it('should parse query correctly', () => {
      const query = 'keyword exactPhrase value1 or keyword exactPhrase value2';

      expect(advancedSearchQueryToRows(query)).to.have.deep.members([{
        query: 'value1',
        bool: '',
        searchOption: 'keyword',
        match: 'exactPhrase',
      }, {
        query: 'value2',
        bool: 'or',
        searchOption: 'keyword',
        match: 'exactPhrase',
      }]);
    });
  });

  describe('when query contains match option as part of value', () => {
    it('should parse query correctly', () => {
      const query = 'keyword containsAny containsAny1';

      expect(advancedSearchQueryToRows(query)).to.deep.include({
        query: 'containsAny1',
        bool: '',
        searchOption: 'keyword',
        match: 'containsAny',
      });
    });
  });

  describe('when query without match and search option', () => {
    it('should parse query correctly', () => {
      const query = 'test';

      expect(advancedSearchQueryToRows(query)).to.deep.include({
        query,
        bool: '',
        searchOption: 'keyword',
        match: 'containsAll',
      });
    });
  });
});

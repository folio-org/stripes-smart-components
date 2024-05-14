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

  describe('when query contains boolean option as part of value', () => {
    it('should parse query correctly', () => {
      const query = 'keyword containsAny some text and some other text';

      expect(advancedSearchQueryToRows(query)).to.deep.include({
        query: 'some text and some other text',
        bool: '',
        searchOption: 'keyword',
        match: 'containsAny',
      });
    });
  });

  describe('when query contains boolean option and match option as part of value, but no search option', () => {
    it('should parse query correctly', () => {
      const query = 'keyword containsAny some text and containsAny';

      expect(advancedSearchQueryToRows(query)).to.deep.include({
        query: 'some text and containsAny',
        bool: '',
        searchOption: 'keyword',
        match: 'containsAny',
      });
    });
  });

  describe('when query contains search option and match option as part of value, but no boolean', () => {
    it('should parse query correctly', () => {
      const query = 'keyword containsAny some text keyword containsAny some other text';

      expect(advancedSearchQueryToRows(query)).to.deep.include({
        query: 'some text keyword containsAny some other text',
        bool: '',
        searchOption: 'keyword',
        match: 'containsAny',
      });
    });
  });

  describe('when query without match and search option', () => {
    it('should use default value for match and search option', () => {
      const query = 'test';

      expect(advancedSearchQueryToRows(query)).to.deep.include({
        query,
        bool: '',
        searchOption: 'keyword',
        match: 'containsAll',
      });
    });
  });

  describe('when a query value contains repeated spaces', () => {
    it('should keep the spaces inside query value', () => {
      const query = 'keyword containsAny some         text or keyword containsAny some     other     text';

      expect(advancedSearchQueryToRows(query)).to.have.deep.members([{
        query: 'some         text',
        bool: '',
        searchOption: 'keyword',
        match: 'containsAny',
      }, {
        query: 'some     other     text',
        bool: 'or',
        searchOption: 'keyword',
        match: 'containsAny',
      }]);
    });
  });

  describe('when there are repeated spaces outside of query', () => {
    it('should parse query correctly', () => {
      const query = 'keyword      containsAny some         text   or   keyword   containsAny some     other     text';

      expect(advancedSearchQueryToRows(query)).to.have.deep.members([{
        query: 'some         text',
        bool: '',
        searchOption: 'keyword',
        match: 'containsAny',
      }, {
        query: 'some     other     text',
        bool: 'or',
        searchOption: 'keyword',
        match: 'containsAny',
      }]);
    });
  });
});

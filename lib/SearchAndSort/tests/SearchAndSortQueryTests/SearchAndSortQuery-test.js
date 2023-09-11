import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import {
  Bigtest,
  Button,
  TextField,
  HTML,
  including,
  IconButton,
  Checkbox,
} from '@folio/stripes-testing';
import { setupApplication } from '../../../../tests/helpers';
import SASQTestHarness from './SASQTestHarness';

describe('SearchAndSortQuery Navigation', () => {
  setupApplication({
    component: (
      <SASQTestHarness
        testQindex="contributors"
        testQindexLabel="test-qindex-nav"
        testQuery="testquery"
        testQueryLabel="test-query-nav"
        initialSearchState={{ query: '', qindex: '' }}
      />)
  });

  beforeEach(async function () {
    this.server.get('/samples', function ({ users }) {
      const res = users.all();
      return this.serialize(res, 'users');
    });
    await this.server.createList('user', 1000);
  });

  describe('Selecting a query index', () => {
    beforeEach(async () => {
      await Bigtest.Select().choose('contributors');
    });

    it('does not affect query', () => HTML({ id: 'query-debug' }).has({ text: 'search:' }));

    describe('Clicking the search button', () => {
      beforeEach(async () => {
        await TextField().fillIn('test');
        await Button('Search').click();
      });

      it('resetting the query', () => HTML({ id: 'query-debug' }).has({ text: including('qindex') }));

      describe('Clicking the reset all', () => {
        beforeEach(async () => {
          await Button('Reset all').click();
        });

        it('removes the search from the query string', () => HTML({ id: 'query-debug' }).has({ text: 'search:' }));
      });
    });
  });


  describe('navigating to a qindex parameter', () => {
    beforeEach(async () => {
      await Button('test-qindex-nav').click();
    });

    it('syncs search index select accordingly', () => Bigtest.Select({ value: 'contributors' }).exists());
  });

  describe('navigating to a query parameter', () => {
    beforeEach(async () => {
      await Button('test-query-nav').click();
    });

    it('syncs search text field accordingly', () => TextField({ value: 'testquery' }).exists());
  });

  describe('testing initial query state', () => {
    setupApplication({
      component: (
        <SASQTestHarness
          testQindex="contributors"
          testQindexLabel="test-qindex-nav"
          testQuery="testquery"
          testQueryLabel="test-query-nav"
          initialSearchState={{ query: 'testSearch', qindex: 'title' }}
          initialFilterState={{ status: ['active'] }}
        />)
    });

    describe('rendering initial query state', () => {
      it('renders the correct search field value', () => TextField({ value: 'testSearch' }).exists());
      it('renders the correct qindex field value', () => Bigtest.Select({ value: 'title' }).exists());
      it('includes all necessary query information in the query string', () => {
        return HTML(including('?filters=status.active&qindex=title&query=testSearch')).exists();
      });
    });

    describe('clicking the reset button on the filter group', () => {
      beforeEach(async () => {
        await IconButton({ icon: 'times-circle-solid' }).click();
      });

      it('clears default filters', () => {
        return Checkbox('active').is({ checked: false });
      });

      it('removes the filter from the query string', () => {
        return HTML(including('?qindex=title&query=testSearch')).exists();
      });
    });
  });
});

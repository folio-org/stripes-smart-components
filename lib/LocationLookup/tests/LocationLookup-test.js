import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import {
  Button,
  Modal,
  Select,
  Selection,
} from '@folio/stripes-testing';

import { Response } from 'miragejs';
import sinon from 'sinon';

import LocationLookup from '../LocationLookup';
import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

const ConnectedComponent = connectStripes(LocationLookup);

const LocationLookupForm = Modal.extend('location look-up modal')
  .actions({
    selectInstitution: async ({ find }, option) => { await find(Select('Institution')).choose(option); }
  });

const LocationSelection = Selection.extend('Location selection')
  .filters({
    disabled: (el) => Boolean(el.querySelector('button:disabled'))
  });

describe('LocationLookup', () => {
  const lookUpButton = Button('Location look-up');
  const lookUpForm = LocationLookupForm();

  setupApplication();
  const onLocationSelected = sinon.spy();

  beforeEach(async function () {
    this.server.get('location-units/institutions', (schema, request) => {
      return new Response(200, { 'X-Request-URL': request.url }, {
        'locinsts' : [{
          'id' : '123',
          'name' : 'Harvard University',
          'code' : 'hu'
        }, {
          'id' : '456',
          'name' : 'Cornell University',
          'code' : 'cu'
        }],
        'totalRecords' : 2
      });
    });

    this.server.get('location-units/campuses', (schema, request) => {
      const campuses = [{
        'id' : '111',
        'name' : 'Main Campus',
        'code' : 'mc',
        'institutionId' : '456',
      }, {
        'id' : '222',
        'name' : 'Weill Cornell Medicine',
        'code' : 'wcm',
        'institutionId' : '456',
      }];

      const matches = request.queryParams.query.match(/"([^"]+)"/);
      const institutionId = matches ? matches[1] : null;

      return new Response(200, { 'X-Request-URL': request.url }, {
        'loccamps' : campuses.filter(c => c.institutionId === institutionId),
        'totalRecords' : 2
      });
    });

    this.server.get('location-units/libraries', (schema, request) => {
      const libraries = [{
        'id' : '333',
        'name' : 'Mann Library',
        'code' : 'mann',
        'campusId' : '111',
      }, {
        'id' : '444',
        'name' : 'Olin Library',
        'code' : 'olin',
        'campusId' : '111',
      }, {
        'id' : '555',
        'name' : 'Uris Library',
        'code' : 'uris',
        'campusId' : '111',
      }];

      const matches = request.queryParams.query.match(/"([^"]+)"/);
      const campusId = matches ? matches[1] : null;

      return new Response(200, { 'X-Request-URL': request.url }, {
        'loclibs' : libraries.filter(c => c.campusId === campusId),
        'totalRecords' : 3
      });
    });

    this.server.get('locations', (schema, request) => {
      const locations = [{
        'id' : '666',
        'name' : 'Uris Circulation',
        'code' : 'uris / circ',
        'discoveryDisplayName' : 'Uris Circulation',
        'isActive' : true,
        'institutionId' : '123',
        'campusId' : '111',
        'libraryId' : '555',
      }, {
        'id' : '777',
        'name' : 'Uris Reference',
        'code' : 'uris / ref',
        'discoveryDisplayName' : 'Uris Reference',
        'isActive' : true,
        'institutionId' : '456',
        'campusId' : '111',
        'libraryId' : '555'
      }, {
        'id' : '888',
        'name' : 'Uris Stacks',
        'code' : 'uris / stacks',
        'discoveryDisplayName' : 'Uris Stacks',
        'isActive' : true,
        'institutionId' : '456',
        'campusId' : '111',
        'libraryId' : '555'
      }];

      const matches = request.queryParams.query.match(/"([^"]+)"/);
      const libraryId = matches ? matches[1] : null;

      return new Response(200, { 'X-Request-URL': request.url }, {
        'locations' : locations.filter(c => c.libraryId === libraryId),
        'totalRecords' : 3
      });
    });

    mount(<ConnectedComponent onLocationSelected={onLocationSelected} />);
  });

  describe('shows a button to open the modal', () => {
    it('lookup button is present', () => lookUpButton.exists());

    it('lookup form is absent', () => lookUpForm.absent());
  });

  describe('Lookup button is clicked', () => {
    beforeEach(async () => {
      await lookUpButton.click();
    });

    it('displays the form with disabled fields', () => Promise.all([
      lookUpForm.exists(),
      Select('Institution').has({ optionsText: ['Select institution', 'Harvard University', 'Cornell University'] }),
      Select('Campus').is({ disabled: true }),
      Select('Library').is({ disabled: true }),
      LocationSelection('Location').is({ disabled: true }),
      Button('Save & close').is({ disabled: true }),
    ]));

    describe('An institution with campuses is selected', () => {
      beforeEach(async () => {
        await Select('Institution').choose('Cornell University');
      });

      it('the campus menu populates', () => Promise.all([
        Select('Campus').is({ disabled: false }),
        Select('Campus').has({ optionsText: ['Select campus', 'Main Campus', 'Weill Cornell Medicine'] }),
        Select('Library').is({ disabled: true }),
      ]));
    });

    describe('An institution and campus are selected', () => {
      beforeEach(async () => {
        await Select('Institution').choose('Cornell University');
        await Select('Campus').has({ optionsText: ['Select campus', 'Main Campus', 'Weill Cornell Medicine'] });
        await Select('Campus').choose('Main Campus');
      });

      it('the library menu populates', () => Promise.all([
        Select('Library').is({ disabled: false }),
        Select('Library').has({ optionsText: [
          'Select library',
          'Mann Library',
          'Olin Library',
          'Uris Library'
        ] })
      ]));
    });

    describe('An institution and campus and library are selected', () => {
      beforeEach(async () => {
        await Select('Institution').choose('Cornell University');
        await Select('Campus').choose('Main Campus');
        await Select('Library').choose('Uris Library');
        await Selection('Location').click();
      });

      it('the location menu populates', () => Promise.all([
        Select('Campus').has({ optionsText: ['Select campus', 'Main Campus', 'Weill Cornell Medicine'] }),
        Select('Library').is({ disabled: false }),
        LocationSelection('Location').is({ disabled: false }),
      ]));
    });

    describe('An institution without campuses is selected', () => {
      beforeEach(async () => {
        await Select('Institution').choose('Harvard University');
      });

      it('disables the appropriate controls', () => Promise.all([
        Select('Campus').is({ disabled: true }),
        Select('Library').is({ disabled: true }),
        LocationSelection('Location').is({ disabled: true }),
        Button('Save & close').is({ disabled: true }),
      ]));
    });
  });
});

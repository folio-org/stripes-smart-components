import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { when } from '@bigtest/convergence';
import { Response } from '@bigtest/mirage';
import { expect } from 'chai';
import sinon from 'sinon';

import LocationLookup from '../LocationLookup';
import LocationLookupInteractor from './interactor';
import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

const ConnectedComponent = connectStripes(LocationLookup);

describe('LocationLookup', () => {
  const ll = new LocationLookupInteractor();

  setupApplication();

  let institutionsLoaded = false;
  let campusesLoaded = false;
  let librariesLoaded = false;
  let locationsLoaded = false;
  const onLocationSelected = sinon.spy();

  beforeEach(async function () {
    this.server.get('location-units/institutions', (schema, request) => {
      institutionsLoaded = true;
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

      campusesLoaded = true;
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

      librariesLoaded = true;
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

      locationsLoaded = true;
      return new Response(200, { 'X-Request-URL': request.url }, {
        'locations' : locations.filter(c => c.libraryId === libraryId),
        'totalRecords' : 3
      });
    });

    mount(<ConnectedComponent onLocationSelected={onLocationSelected} />);
  });

  describe('shows a button to open the modal', () => {
    it('lookup button is present', () => {
      expect(ll.isLookupButtonPresent).to.be.true;
    });

    it('lookup form is absent', () => {
      expect(ll.isLookupFormPresent).to.be.false;
    });
  });

  describe('Lookup button is clicked', () => {
    beforeEach(async () => {
      await ll.clickLookupButton();
      await when(() => institutionsLoaded);
    });

    it('displays the form with disabled fields', () => {
      expect(ll.isLookupFormPresent).to.be.true;
      expect(ll.institutionCount).to.equal(3);

      expect(ll.campusDisabled).to.be.true;
      expect(ll.libraryDisabled).to.be.true;
      expect(ll.locationDisabled).to.be.true;
      expect(ll.saveDisabled).to.be.true;
    });

    // it('displays default selections', () => {
    //   expect(ll.firstInstitution).to.equal('Select institution');
    //   expect(ll.firstCampus).to.equal('Select campus');
    //   expect(ll.firstLibrary).to.equal('Select library');
    // });

    describe('An institution with campuses is selected', () => {
      beforeEach(async () => {
        await ll.selectInstitution('Cornell University');
        await when(() => campusesLoaded);
      });

      it('the campus menu populates', () => {
        expect(ll.campusCount).to.equal(3);
        expect(ll.libraryDisabled).to.be.true;
      });
    });

    describe('An institution and campus are selected', () => {
      beforeEach(async () => {
        await ll.selectInstitution('Cornell University');
        await when(() => campusesLoaded);
        await ll.selectCampus('Main Campus');
        await when(() => librariesLoaded);
      });

      it('the library menu populates', () => {
        expect(ll.campusCount).to.equal(3);
        expect(ll.libraryDisabled).to.be.false;
        expect(ll.libraryCount).to.equal(4);
      });
    });

    describe('An institution and campus and library are selected', () => {
      beforeEach(async () => {
        await ll.selectInstitution('Cornell University');
        await when(() => campusesLoaded);

        await ll.selectCampus('Main Campus');
        await when(() => librariesLoaded);

        await ll.selectLibrary('Uris Library');
        await when(() => locationsLoaded);

        await ll.focusLocation;
      });

      it('the location menu populates', () => {
        expect(ll.campusCount).to.equal(3);
        expect(ll.libraryDisabled).to.be.false;
        expect(ll.libraryCount).to.equal(4);
      });

      // describe('A location is selected', () => {
      //   beforeEach(async () => {
      //     await ll.clickLocation();
      //     await ll.locations(2).click();
      //     await ll.clickSaveButton();
      //   });
      //
      //   it('shows a location', () => {
      //     expect(ll.locationValue).to.equal('Uris Circulation - (uris / circ)');
      //   });
      //
      //   describe('Save is clicked', () => {
      //     beforeEach(async () => {
      //       await ll.clickSaveButton();
      //     });
      //
      //     it('calls callback', () => {
      //       expect(onLocationSelected).to.be.called;
      //     });
      //   });
      // });
    });

    describe('An institution without campuses is selected', () => {
      beforeEach(async () => {
        await ll.selectInstitution('Harvard University');
        await when(() => campusesLoaded);
      });

      it('the campus menu is disabled', () => {
        expect(ll.campusDisabled).to.be.true;
      });
      it('the library menu is disabled', () => {
        expect(ll.libraryDisabled).to.be.true;
      });
      it('the location menu is disabled', () => {
        expect(ll.locationDisabled).to.be.true;
      });
    });
  });
});

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

  beforeEach(async function () {
    let institutionsLoaded = false;
    let campusesLoaded = false;
    let librariesLoaded = false;
    let locationsLoaded = false;

    this.server.get('location-units/institutions', (schema, request) => {
      institutionsLoaded = true;
      return new Response(200, { 'X-Request-URL': request.url }, {
        'locinsts' : [{
          'id' : '16e4d83d-a076-4175-a810-90190eb2954c',
          'name' : 'Harvard University',
          'code' : 'hu'
        }, {
          'id' : '16e4d83d-a076-4175-a810-90190eb2954c',
          'name' : 'Cornell University',
          'code' : 'cu'
        }],
        'totalRecords' : 2
      });
    });

    this.server.get('location-units/campuses', (schema, request) => {
      campusesLoaded = true;
      return new Response(200, { 'X-Request-URL': request.url }, {
        'loccamps' : [{
          'id' : '92cd6156-44eb-482c-9852-99e25d4ede4a',
          'name' : 'Main Campus',
          'code' : 'mc',
          'institutionId' : '16e4d83d-a076-4175-a810-90190eb2954c',
        }, {
          'id' : 'c1d51a99-428c-44ee-9df4-8dc259b3d7eb',
          'name' : 'Weill Cornell Medicine',
          'code' : 'wcm',
          'institutionId' : '16e4d83d-a076-4175-a810-90190eb2954c',
        }],
        'totalRecords' : 2
      });
    });

    this.server.get('location-units/libraries', (schema, request) => {
      librariesLoaded = true;
      return new Response(200, { 'X-Request-URL': request.url }, {
        'loclibs' : [{
          'id' : '3fb6a4cf-362a-4d59-8558-9bee67fd50eb',
          'name' : 'Mann Library',
          'code' : 'mann',
          'campusId' : '92cd6156-44eb-482c-9852-99e25d4ede4a',
        }, {
          'id' : '9858a6b1-4600-493b-843e-7bddbd9b3bcf',
          'name' : 'Olin Library',
          'code' : 'olin',
          'campusId' : '92cd6156-44eb-482c-9852-99e25d4ede4a',
        }, {
          'id' : '171494ea-b9e6-41ce-8c04-967de9a81b99',
          'name' : 'Uris Library',
          'code' : 'uris',
          'campusId' : '92cd6156-44eb-482c-9852-99e25d4ede4a',
        }],
        'totalRecords' : 3
      });
    });

    this.server.get('locations', (schema, request) => {
      locationsLoaded = true;
      return new Response(200, { 'X-Request-URL': request.url }, {
        'locations' : [{
          'id' : '2ca33620-09f3-46ba-8515-caf6992c5755',
          'name' : 'Uris Circulation',
          'code' : 'uris / circ',
          'discoveryDisplayName' : 'Uris Circulation',
          'isActive' : true,
          'institutionId' : '16e4d83d-a076-4175-a810-90190eb2954c',
          'campusId' : '92cd6156-44eb-482c-9852-99e25d4ede4a',
          'libraryId' : '171494ea-b9e6-41ce-8c04-967de9a81b99',
        }, {
          'id' : '5d5cf7e7-e117-4465-ad63-0bc7baa17498',
          'name' : 'Uris Reference',
          'code' : 'uris / ref',
          'discoveryDisplayName' : 'Uris Reference',
          'isActive' : true,
          'institutionId' : '16e4d83d-a076-4175-a810-90190eb2954c',
          'campusId' : '92cd6156-44eb-482c-9852-99e25d4ede4a',
          'libraryId' : '171494ea-b9e6-41ce-8c04-967de9a81b99'
        }, {
          'id' : 'e0cee8ca-da54-44c5-9fc1-1625f6765485',
          'name' : 'Uris Stacks',
          'code' : 'uris / stacks',
          'discoveryDisplayName' : 'Uris Stacks',
          'isActive' : true,
          'institutionId' : '16e4d83d-a076-4175-a810-90190eb2954c',
          'campusId' : '92cd6156-44eb-482c-9852-99e25d4ede4a',
          'libraryId' : '171494ea-b9e6-41ce-8c04-967de9a81b99'
        }],
        'totalRecords' : 3
      });
    });

    const onLocationSelected = sinon.spy();

    mount(<ConnectedComponent onLocationSelected={onLocationSelected} />);
  });

  describe('Component loads', () => {
    it('lookup button is present', () => {
      expect(ll.isLookupButtonPresent).to.be.true;
    });

    it('lookup form is absent', () => {
      expect(ll.isLookupFormPresent).to.be.false;
    });

    it('lookup button is present', () => {
      expect(ll.isLookupButtonPresent).to.be.true;
    });
    it('lookup button is absent', () => {
      expect(ll.isLookupButtonPresent).to.be.false;
    });
    it('lookup button is pressed', () => {
      beforeEach(async () => {
        await ll.lookupButton.click();

        let institutionsLoaded = false;

        this.server.get('location-units/institutions', (schema, request) => {
          institutionsLoaded = true;
          return new Response(200, { 'X-Request-URL': request.url }, {
            'locinsts' : [{
              'id' : '16e4d83d-a076-4175-a810-90190eb2954c',
              'name' : 'Harvard University',
              'code' : 'hu'
            }, {
              'id' : '16e4d83d-a076-4175-a810-90190eb2954c',
              'name' : 'Cornell University',
              'code' : 'cu'
            }],
            'totalRecords' : 2
          });
        });

        await when(() => institutionsLoaded);
        await when(() => ll.isLookupFormPresent, 5000);
      });

      expect(ll.institutionCount).to.equal(3);
      // expect(ll.institution).to.be.true;
      // expect(ll.institutionCount).to.equal(2);
      // expect(ll.campusDisabled).to.be.true;
    });

    // it('cancel button is present', () => {
    //   expect(cv.cancelButton).to.exist;
    // });
    //
    // describe('input field is blurred', () => {
    //   beforeEach(async () => {
    //     await cv.blurInputField();
    //   });
    //
    //   it('error message is present', () => {
    //     expect(cv.emptyFieldError).to.equal('Please fill this in to continue');
    //   });
    // });
    //
    // describe('input field is focused', () => {
    //   beforeEach(async () => {
    //     await cv.fillInputField('asdf');
    //   });
    //
    //   it('error message is not present', () => {
    //     expect(cv.emptyFieldError).to.equal('');
    //   });
    //
    //   it('save button is enabled', () => {
    //     expect(cv.disabledSaveButton).to.be.false;
    //   });
    // });
  });
});

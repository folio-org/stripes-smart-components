import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { Response } from 'miragejs';
import { including, MetaSection as MetaSectionInteractor, HTML } from '@folio/stripes-testing';

import { setupApplication, mount } from '../../../tests/helpers';
import ViewMetaData from '../ViewMetaData';

describe('ViewMetaData', () => {
  const metaSection = MetaSectionInteractor();
  describe('MetaData is displayed given proper permissions', () => {
    setupApplication({
      permissions: {
        'users.collection.get': true,
      },
    });


    describe('Metadata is displayed when children prop as a function to render metadata is provided', async () => {
      beforeEach(async function () {
        this.server.get('users', (schema, request) => {
          return new Response(200, { 'X-Request-URL': request.url }, {
            'users': [
              {
                'username': 'ecornell',
                'id': 'user-1',
                'personal': {
                  'lastName': 'Cornell',
                  'firstName': 'Ezra',
                  'email': 'ecornell@example.edu'
                }
              }
            ],
            'totalRecords': 1,
            'resultInfo': {
              'totalRecords': 1,
              'facets': [],
              'diagnostics': []
            }
          });
        });

        await mount(
          <ViewMetaData
            showUserLink
            metadata={{
              'createdDate' : '2019-04-01T00:22:44.885+0000',
              'createdByUserId' : 'SYSTEM_USER',
              'updatedDate' : '2019-04-15T11:33:55.885+0000',
              'updatedByUserId' : 'SYSTEM_USER'
            }}
            systemId="SYSTEM_USER"
            systemUser={{
              'username': 'system',
              'id': 'SYSTEM_USER',
              'personal': {
                'lastName': 'SYSTEM',
                'firstName': 'USER',
                'email': 'system@example.edu'
              }
            }}
          >
            {
              (updaterDetails) => (
                <div id="metaSectionFromChildren">
                  { updaterDetails?.lastUpdatedBy?.username }
                </div>
              )
            }
          </ViewMetaData>
        );
      });

      it('should render meta section from child render prop', () => {
        expect(HTML({ id: '#metaSectionFromChildren' })).to.exist;
      });
    });

    describe('Metadata is displayed when children prop as a function to render metadata is not provided', () => {
      beforeEach(async function () {
        this.server.get('users', (schema, request) => {
          return new Response(200, { 'X-Request-URL': request.url }, {
            'users': [
              {
                'username': 'ecornell',
                'id': 'user-1',
                'personal': {
                  'lastName': 'Cornell',
                  'firstName': 'Ezra',
                  'email': 'ecornell@example.edu'
                }
              }
            ],
            'totalRecords': 1,
            'resultInfo': {
              'totalRecords': 1,
              'facets': [],
              'diagnostics': []
            }
          });
        });

        await mount(
          <ViewMetaData
            showUserLink
            metadata={{
              'createdDate' : '2019-04-01T00:22:44.885+0000',
              'createdByUserId' : 'SYSTEM_USER',
              'updatedDate' : '2019-04-15T11:33:55.885+0000',
              'updatedByUserId' : 'user-1'
            }}
            systemId="SYSTEM_USER"
            systemUser={{
              'username': 'system',
              'id': 'SYSTEM_USER',
              'personal': {
                'lastName': 'SYSTEM',
                'firstName': 'USER',
                'email': 'system@example.edu'
              }
            }}
          />
        );

        await metaSection.focus();
        await metaSection.clickHeader();
      });

      it('Given system-id, system-user details display',
        () => metaSection.has({ createdByText: including('Source: SYSTEM, USER') }));

      it('Given user-id, user details display',
        () => metaSection.has({ updatedByText: including('Source: Cornell, Ezra') }));

      it('Given user-id, user details are linked to a user profile',
        () => metaSection.has({ updatedByLink: including('Cornell') }));
    });
  });

  describe('MetaData is NOT displayed without proper permissions', () => {
    setupApplication();
    beforeEach(async () => {
      await mount(
        <ViewMetaData
          showUserLink
          metadata={{
            'createdDate' : '2019-04-01T00:22:44.885+0000',
            'createdByUserId' : 'SYSTEM_USER',
            'updatedDate' : '2019-04-15T11:33:55.885+0000',
            'updatedByUserId' : 'user-1'
          }}
          systemId="SYSTEM_USER"
          systemUser={{
            'username': 'system',
            'id': 'SYSTEM_USER',
            'personal': {
              'lastName': 'SYSTEM',
              'firstName': 'USER',
              'email': 'system@example.edu'
            }
          }}
        />
      );
      await metaSection.focus();
      await metaSection.clickHeader();
    });

    it('Given system-id, system-user details display',
      () => metaSection.has({ createdByText: including('Source: SYSTEM, USER') }));

    it('Given user-id, unknown-user details display instead',
      () => metaSection.has({ updatedByText: including('Source: Unknown user') }));

    it('Given user-id, details are not linked to a user profile',
      () => metaSection.has({ updatedByLink: undefined }));
  });
});

import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { when } from '@bigtest/convergence';
import { Response } from 'miragejs';
import { including, not, MetaSection as MetaSectionInteractor } from '@folio/stripes-testing';

import ViewMetaData from '../ViewMetaData';
import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

const ConnectedComponent = connectStripes(ViewMetaData);

describe('ViewMetaData', () => {
  const metaSection = MetaSectionInteractor();
  describe('MetaData is displayed given proper permissions', () => {
    setupApplication({
      permissions: {
        'users.collection.get': true,
      },
    });

    beforeEach(async function () {
      let usersLoaded = false;

      this.server.get('users', (schema, request) => {
        usersLoaded = true;
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
        <ConnectedComponent
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

      await when(() => usersLoaded);
      await metaSection.focus();
      await metaSection.clickHeader();
    });

    it('Given system-id, system-user details display',
      async () => metaSection.has({ createdByText: including('Source: SYSTEM, USER') }));

    it('Given user-id, user details display',
      async () => metaSection.has({ updatedByText: including('Source: Cornell, Ezra') }));

    it('Given user-id, user details are linked to a user profile',
      async () => metaSection.has({ updatedByLink: including('Cornell') }));
  });

  describe('MetaData is NOT displayed without proper permissions', () => {
    setupApplication();
    beforeEach(async () => {
      await mount(
        <ConnectedComponent
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
      async () => metaSection.has({ createdByText: including('Source: SYSTEM, USER') }));


    it('Given user-id, automated-process details display instead',
      async () => metaSection.has({ updatedByText: including('Source: Automated process') }));

    it('Given user-id, details are not linked to a user profile',
      async () => metaSection.has({ updatedByLink: undefined }));
  });
});

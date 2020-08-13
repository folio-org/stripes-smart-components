import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { when } from '@bigtest/convergence';
import { Response } from 'miragejs';
import { expect } from 'chai';

import ViewMetaData from '../ViewMetaData';
import ViewMetaDataInteractor from './interactor';
import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

const ConnectedComponent = connectStripes(ViewMetaData);

describe('ViewMetaData', () => {
  const vmd = new ViewMetaDataInteractor();

  describe('MetaData is displayed given proper permissions', () => {
    setupApplication({
      permissions: {
        'ui-users.view': true,
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
    });

    it('Given system-id, system-user details display', () => {
      expect(vmd.metaSection.createdByText).to.equal('Source: SYSTEM, USER');
    });

    // it('System-user details are not linked to a user profile', () => {
    //   expect(vmd.metaSection.createdByLinkIsPresent).to.be.false;
    // });

    it('Given user-id, user details display', () => {
      expect(vmd.metaSection.updatedByText).to.equal('Source: Cornell, Ezra');
    });

    it('Given user-id, user details are linked to a user profile', () => {
      expect(vmd.metaSection.updatedByLinkIsPresent).to.be.true;
    });
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
    });

    it('Given system-id, system-user details display', () => {
      expect(vmd.metaSection.createdByText).to.equal('Source: SYSTEM, USER');
    });

    it('Given user-id, automated-process details display instead', () => {
      expect(vmd.metaSection.updatedByText).to.equal('Source: Automated process');
    });

    it('Given user-id, details are not linked to a user profile', () => {
      expect(vmd.metaSection.updatedByLinkIsPresent).to.be.false;
    });
  });
});

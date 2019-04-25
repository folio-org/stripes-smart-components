import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { when } from '@bigtest/convergence';
import { Response } from '@bigtest/mirage';
import { expect } from 'chai';

import ViewMetaData from '../ViewMetaData';
import ViewMetaDataInteractor from './interactor';
import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

const ConnectedComponent = connectStripes(ViewMetaData);

describe('ViewMetaData', () => {
  const vmd = new ViewMetaDataInteractor();

  setupApplication();

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

    mount(
      <ConnectedComponent
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

  describe('MetaData is displayed', () => {
    it('Creator name is present', () => {
      expect(vmd.creatorName).to.equal('Source: SYSTEM, USER');
    });

    it('Creator datestamp is present', () => {
      expect(vmd.creatorDate).to.equal('Record created: 4/1/2019 12:22 AM');
    });

    it('Updater name is present', () => {
      expect(vmd.updaterName).to.equal('Source: Cornell, Ezra');
    });

    it('Updater datestamp is present', () => {
      expect(vmd.updaterDate).to.equal('Record last updated: 4/15/2019 11:33 AM');
    });
  });
});

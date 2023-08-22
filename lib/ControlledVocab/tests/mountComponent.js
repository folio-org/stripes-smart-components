import React from 'react';
import sinon from 'sinon';

import { Response } from 'miragejs';
import { when } from '@bigtest/convergence';

import connectStripes from '../../../tests/connectStripes';

import { mount } from '../../../tests/helpers';
import ControlledVocab from '../ControlledVocab';

const ConnectedComponent = connectStripes(ControlledVocab);

export default async function (editable, server, props) {
  let valuesLoaded = false;
  let usersLoaded = false;

  server.get('location-units/institutions', (schema, request) => {
    valuesLoaded = true;

    // stripes-connect requires `X-Request-URL` header for `response.url`
    return new Response(200, { 'X-Request-URL': request.url }, {
      'locinsts' : [{
        'id' : '40ee00ca-a518-4b49-be01-0638d0a4ac57',
        'name' : 'Bowdoin College',
        'code' : 'BC'
      }, {
        'id' : '786bccb0-1795-4896-9452-a6e5bd5f28ac',
        'name' : 'Harvard University',
        'code' : 'hu',
        'metadata' : {
          'createdDate' : '2019-04-18T16:09:26.816+0000',
          'createdByUserId' : 'user-1',
          'updatedDate' : '2019-04-18T16:09:26.816+0000',
          'updatedByUserId' : 'user-1'
        }
      }, {
        'id' : '16e4d83d-a076-4175-a810-90190eb2954c',
        'name' : 'Dartmouth College',
        'code' : 'dc',
        'metadata' : {
          'createdDate' : '2019-04-18T16:41:36.806+0000',
          'createdByUserId' : 'user-1',
          'updatedDate' : '2019-04-18T16:41:36.806+0000',
          'updatedByUserId' : 'user-1',
        }
      }, {
        'id' : '16e4d83d-a076-4175-a810-90190eb2954c',
        'name' : 'University of Maryland, Baltimore',
        'code' : 'umb',
        'metadata' : {
          'createdDate' : '2019-04-18T16:41:36.806+0000',
          'createdByUserId' : 'user-2',
          'updatedDate' : '2019-04-18T16:41:36.806+0000',
          'updatedByUserId' : 'user-2',
        }
      }, {
        'id' : '16e4d83d-a076-4175-a810-90190eb2954c',
        'name' : 'Cornell University',
        'code' : 'cu',
        'metadata' : {
          'createdDate' : '2019-04-18T16:41:36.806+0000',
          'createdByUserId' : 'user-2',
          'updatedDate' : '2019-04-18T16:41:36.806+0000',
          'updatedByUserId' : 'user-2'
        }
      }],
      'totalRecords' : 5
    });
  });

  server.get('users', (schema, request) => {
    usersLoaded = true;
    return new Response(200, { 'X-Request-URL': request.url }, {
      'users': [
        {
          'username': 'jharvard',
          'id': 'user-1',
          // 'personal': {
          //   'lastName': 'John',
          //   'firstName': 'Harvard',
          //   'email': 'jharvard@example.edu',
          //   'preferredContactTypeId': '004'
          // }
        }, {
          'username': 'ecornell',
          'id': 'user-2',
          'personal': {
            'lastName': 'Ezra',
            'firstName': 'Cornell',
            'email': 'ecornell@example.edu',
            'preferredContactTypeId': '004'
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

  const onEditHandler = sinon.spy();
  const onDeleteHandler = sinon.spy();

  mount(
    <ConnectedComponent
      baseUrl="location-units/institutions"
      records="locinsts"
      label="Institutions"
      objectLabel="Location"
      visibleFields={['name', 'code', 'source']}
      columnMapping={{
        name: 'name',
        code: 'code',
        source: 'source',
      }}
      readOnlyFields={['source']}
      itemTemplate={{ source: 'local' }}
      hiddenFields={['description', 'numberOfObjects']}
      nameKey="name"
      // columnWidths={{ 'name': 300, 'code': 50 }}
      actionSuppressor={{ edit: onEditHandler, delete: onDeleteHandler }}
      id="institutions"
      sortby="name"
      editable={editable}
      {...props}
    />
  );

  await when(() => valuesLoaded);
  await when(() => usersLoaded);
}

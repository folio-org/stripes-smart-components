// typical mirage config export
export default function config() {
  // okapi endpoints

  this.get('_/proxy/tenants/:id/modules', [
    {
      id: 'users-module-id',
      name: 'users-test',
    },
  ]);

  this.get('/note-types');

  this.post('location-units/institutions', {
    'errors' : [{
      'message' : 'Cannot create entity; name is not unique',
      'code' : 'name.duplicate',
      'parameters' : [{
        'key' : 'fieldLabel',
        'value' : 'name'
      }]
    },
    {
      'message' : 'test',
      'code' : '-1',
      'parameters' : [{
        'key' : 'test',
        'value' : 'test'
      }]
    }]
  }, 422);

  this.get('/note-links/domain/dummy/type/:type/id/:id', ({ notes }, { params, queryParams }) => {
    return notes.where((note) => {
      const conditions = [];

      if (queryParams.noteType) {
        conditions.push(note.type === queryParams.noteType);
      }

      switch (queryParams.status) {
        case 'assigned': {
          conditions.push(note.links.some(link => {
            return link.type === params.type && link.id === params.id;
          }));

          break;
        }
        case 'unassigned': {
          conditions.push(note.links.every(link => {
            return link.type !== params.type || link.id !== params.id;
          }));

          break;
        }
        default: {
          conditions.push(true);
        }
      }

      return conditions.every(condition => !!condition);
    });
  });

  this.put('/note-links/type/:type/id/:id', ({ notes }, { params, requestBody }) => {
    const body = JSON.parse(requestBody);

    body.notes.forEach((note) => {
      const dbNote = notes.find(note.id);
      const links = [...dbNote.links];

      if (note.status === 'ASSIGNED') {
        links.push({
          id: params.id,
          type: params.type,
        });
      } else {
        for (let i = 0; i < links.length; i++) {
          if (links[i].type === params.type && links[i].id === params.id) {
            links.splice(i, 1);
            break;
          }
        }
      }

      dbNote.update({ links });
    });
  });

  this.get('/configurations/entries', (schema, request) => {
    if (request.url.includes('custom_fields_label')) {
      return {
        configs: [{
          id: 'tested-custom-field-label',
          module: 'USERS',
          configName: 'custom_fields_label',
          enabled: true,
          value: 'Custom Fields Test',
        }],
      };
    }

    return { configs: [] };
  });

  this.get('/custom-fields', {
    'customFields': [{
      'id': '1',
      'name': 'Textbox 1',
      'refId': 'textbox-1',
      'type': 'TEXTBOX_SHORT',
      'entityType': 'user',
      'visible': true,
      'required': true,
      'order': 1,
      'helpText': 'helpful text',
    }, {
      'id': '2',
      'name': 'Textarea 1',
      'refId': 'textarea-1',
      'type': 'TEXTBOX_LONG',
      'entityType': 'user',
      'visible': true,
      'required': false,
      'order': 2,
      'helpText': '',
    }, {
      'id' : '3',
      'name' : 'Single select',
      'refId' : 'single_select-1',
      'type' : 'SINGLE_SELECT_DROPDOWN',
      'entityType' : 'user',
      'visible' : true,
      'required' : false,
      'order' : 3,
      'helpText' : '',
      'selectField' : {
        'defaults' : ['option 1'],
        'multiSelect' : false,
        'options' : {
          'values' : ['option 1', 'option 2'],
          'sorted' : []
        }
      }
    }, {
      'id' : '4',
      'name' : 'Multi select',
      'refId' : 'multi_select-2',
      'type' : 'MULTI_SELECT_DROPDOWN',
      'entityType' : 'user',
      'visible' : true,
      'required' : false,
      'order' : 4,
      'helpText' : '',
      'selectField' : {
        'defaults' : ['option 1', 'option 2'],
        'multiSelect' : true,
        'options' : {
          'values' : ['option 1', 'option 2', 'option 3'],
          'sorted' : []
        }
      }
    }, {
      'id' : '5',
      'name' : 'Radio',
      'refId' : 'radio_1',
      'type' : 'RADIO_BUTTON',
      'entityType' : 'user',
      'visible' : true,
      'required' : false,
      'order' : 5,
      'helpText' : '',
      'selectField' : {
        'defaults' : ['option 1'],
        'multiSelect' : false,
        'options' : {
          'values' : ['option 1', 'option 2'],
          'sorted' : []
        }
      }
    }],
  });

  this.get('/custom-fields/:id/stats', (_, request) => ({
    count: 0,
    entityType: 'user',
    id: request.params.id,
  }));
}

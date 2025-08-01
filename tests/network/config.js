// typical mirage config export
export default function config() {
  this.timing = 0;
  this.namespace = '';

  // okapi endpoints
  this.get('_/proxy/tenants/:id/modules', [
    {
      id: 'users-module-id',
      name: 'users-test',
    },
  ]);

  this.get('/saml/check', {
    ssoEnabled: false
  });

  this.get('/note-types');

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
    }).sort((a, b) => {
      if (queryParams.orderBy === 'updatedDate') {
        const dateA = new Date(a.attrs.metadata.updatedDate);
        const dateB = new Date(b.attrs.metadata.updatedDate);

        return queryParams.order === 'desc'
          ? dateB - dateA
          : dateA - dateB;
      }

      if (queryParams.orderBy === 'title') {
        return queryParams.order === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }

      if (queryParams.orderBy === 'noteType') {
        return queryParams.order === 'asc'
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }

      return 0;
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

    if (request.url.includes('tags_enabled')) {
      return {
        configs: [{
          id: 'tested-tags-config-label',
          module: 'DUMMY',
          configName: 'tags_enabled',
          enabled: true,
          value: 'true',
        }],
      };
    }
    return { configs: [] };
  });

  this.put('/configurations/entries/:id', () => {
    return {};
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
      displayInAccordion: 'feesFines',
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
      displayInAccordion: 'default',
    }, {
      'id': '3',
      'name': 'Single select',
      'refId': 'single_select-1',
      'type': 'SINGLE_SELECT_DROPDOWN',
      'entityType': 'user',
      'visible': true,
      'required': false,
      'order': 3,
      'helpText': '',
      'selectField': {
        'multiSelect': false,
        'options': {
          'values': [{
            'id': 'opt_0',
            'value': 'option 1',
            'default': true
          }, {
            'id': 'opt_1',
            'value': 'option 2',
            'default': false,
          }],
        }
      }
    }, {
      'id': '4',
      'name': 'Multi select',
      'refId': 'multi_select-2',
      'type': 'MULTI_SELECT_DROPDOWN',
      'entityType': 'user',
      'visible': true,
      'required': false,
      'order': 4,
      'helpText': '',
      'selectField': {
        'multiSelect': true,
        'options': {
          'values': [{
            'id': 'opt_0',
            'value': 'option 1',
            'default': true,
          }, {
            'id': 'opt_1',
            'value': 'option 2',
            'default': true,
          }, {
            'id': 'opt_2',
            'value': 'option 3',
            'default': false,
          }],
        }
      }
    }, {
      'id': '5',
      'name': 'Radio',
      'refId': 'radio_1',
      'type': 'RADIO_BUTTON',
      'entityType': 'user',
      'visible': true,
      'required': false,
      'order': 5,
      'helpText': '',
      'selectField': {
        'multiSelect': false,
        'options': {
          'values': [{
            'id': 'opt_0',
            'value': 'option 1',
            'default': true,
          }, {
            'id': 'opt_1',
            'value': 'option 2',
            'default': false,
          }],
        }
      }
    }, {
      'id':'6',
      'name': 'Date',
      'refId': 'date1',
      'type': 'DATE_PICKER',
      'entityType': 'user',
      'visible': true,
      'required': false,
      'order': 6,
      'helpText': 'Enter a date here',
    }, {
      'id': '7',
      'name': 'Checkbox',
      'refId': 'cb_1',
      'type': 'SINGLE_CHECKBOX',
      'entityType': 'user',
      'visible': true,
      'required': false,
      'isRepeatable': false,
      'order': 7,
      'helpText': 'checkbox help text',
      'checkboxField': {
        'default': false
      },
    }],
  });

  this.get('/custom-fields/:id/stats', (_, request) => ({
    count: 0,
    entityType: 'user',
    id: request.params.id,
  }));

  this.get('/custom-fields/:id/options/:opt_id/stats', (_, _request) => ({}));

  this.get('/notes/:id', ({ notes }, { params }) => {
    return notes.find(params.id);
  });

  this.post('/notes', (_, { requestBody }) => {
    const noteData = JSON.parse(requestBody);

    return this.create('note', noteData);
  });

  this.put('/notes/:id', ({ notes, noteTypes }, { params, requestBody }) => {
    const noteData = JSON.parse(requestBody);
    const noteTypeName = noteTypes.find(noteData.typeId).attrs.name;

    return notes.find(params.id).update({
      ...noteData,
      type: noteTypeName,
    });
  });

  this.delete('/notes/:id', ({ notes, noteTypes }, { params }) => {
    const note = notes.find(params.id);
    const noteType = noteTypes.find(note.attrs.typeId);

    noteType.update({
      usage: {
        noteTotal: --noteType.attrs.usage.noteTotal,
      },
    });

    return notes.find(params.id).destroy();
  });

  this.get('/tags', ({ tags }) => {
    return tags.all();
  });

  this.get('/dummy/tagged', function ({ tags }) {
    return this.serialize(tags.all());
  });

  this.post('/tags', (_, { requestBody }) => {
    const tagData = JSON.parse(requestBody);

    this.create('tag', tagData);
  });

  this.put('/dummy/entity', (_, { requestBody }) => {
    const tagData = JSON.parse(requestBody);

    this.create('tag', tagData);
  });

  this.get('/settings/entries', (schema, request) => {
    if (request.url.includes('custom_fields_label')) {
      return {
        items: [{
          id: 'tested-custom-field-label',
          key: 'custom_fields_label',
          scope: 'ui-users.custom-fields.manage',
          value: 'Custom Fields label',
        }],
      };
    }

    return { items: [] };
  });
}

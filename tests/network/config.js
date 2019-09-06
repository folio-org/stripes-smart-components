// typical mirage config export
export default function config() {
  // okapi endpoints
  this.get('/note-types');

  this.post('location-units/institutions', {
    'errors' : [{
      'message' : 'Cannot create entity; name is not unique',
      'code' : 'name.duplicate',
      'parameters' : [{
        'key' : 'fieldLabel',
        'value' : 'name'
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
}

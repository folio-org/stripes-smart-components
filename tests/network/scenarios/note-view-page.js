export default function (server) {
  const firstRequest = {
    id: 'requestId1',
    name: 'Cool Request'
  };

  const secondRequest = {
    id: 'requestId2',
    name: 'Cooler Request',
  };

  const generalNoteType = server.create('note-type', {
    name: 'General',
  });

  server.create('note', {
    type: generalNoteType.name,
    typeId: generalNoteType.id,
    id: 'providerNoteId',
    links: [
      { type: 'request', id: firstRequest.id },
      { type: 'request', id: secondRequest.id },
    ],
  });

  server.create('note', {
    type: generalNoteType.name,
    typeId: generalNoteType.id,
    id: 'neverUpdatedNote',
    links: [{ type: 'request', id: firstRequest.id }],
    title: 'Not updated note',
    metadata: {
      createdDate: '2020-07-07T03:56:29.238+0000',
      createdByUserId: '4d088ad2-fc70-5142-bd4d-9b60707846af',
      createdByUsername: 'diku_admin',
      updatedDate: '2020-07-07T03:56:29.238+0000',
      updatedByUserId: '4d088ad2-fc70-5142-bd4d-9b60707846af',
      updatedByUsername: 'diku_admin',
    },
  });

  server.create('note', {
    type: generalNoteType.name,
    typeId: generalNoteType.id,
    id: 'updatedNote',
    links: [{ type: 'request', id: firstRequest.id }],
    title: 'Updated note',
    metadata: {
      createdDate: '2020-07-07T03:56:29.238+0000',
      createdByUserId: '4d088ad2-fc70-5142-bd4d-9b60707846af',
      createdByUsername: 'diku_admin',
      updatedDate: '2020-07-07T04:56:29.238+0000',
      updatedByUserId: 'fc70-5142-bd4d-9b60707846af-4d088ad2',
      updatedByUsername: 'non-admin',
    },
  });
}

import faker from 'faker';

export default function (server) {
  const provider = {
    id: 'providerId',
    name: 'Cool Provider'
  };

  const generalNoteType = server.create('note-type', {
    name: 'General',
    id: 'general-type-id',
  });

  const urgentNoteType = server.create('note-type', {
    name: 'Urgent',
  });

  server.create('note', {
    type: generalNoteType.name,
    typeId: generalNoteType.id,
    title: 'A Note type',
    content: '<p>Note details</p>',
    metadata: {
      updatedDate: '2020-12-04T09:05:30.000+0000',
    },
    id: 'providerNoteId',
    links: [{ type: 'provider', id: provider.id }],
    popUpOnCheckout: true,
  });

  server.create('note', {
    type: generalNoteType.name,
    typeId: generalNoteType.id,
    id: 'packageNoteId',
    links: [{ type: 'package', id: faker.random.uuid() }],
  });

  server.create('note', {
    type: generalNoteType.name,
    typeId: generalNoteType.id,
    title: 'C Note type',
    metadata: {
      updatedDate: '2019-12-04T09:05:30.000+0000',
    },
    content: new Array(260).fill('a').join(''),
    links: [
      { type: 'package', id: faker.random.uuid() },
      { type: 'provider', id: provider.id },
    ],
  });

  server.create('note', {
    type: urgentNoteType.name,
    typeId: urgentNoteType.id,
    title: 'A Note type',
    metadata: {
      updatedDate: '2018-12-04T09:05:30.000+0000',
    },
    links: [
      { type: 'package', id: faker.random.uuid() },
      { type: 'provider', id: provider.id },
    ],
  });

  server.create('note', {
    type: urgentNoteType.name,
    typeId: urgentNoteType.id,
    links: [{ type: 'package', id: faker.random.uuid() }],
  });
}

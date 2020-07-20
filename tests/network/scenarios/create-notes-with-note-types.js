import { faker } from '@bigtest/mirage';

export default function (server) {
  const provider = {
    id: 'providerId',
    name: 'Cool Provider'
  };

  const generalNoteType = server.create('note-type', {
    name: 'General',
  });

  const urgentNoteType = server.create('note-type', {
    name: 'Urgent',
  });

  server.create('note', {
    type: generalNoteType.name,
    typeId: generalNoteType.id,
    id: 'providerNoteId',
    content: new Array(240).fill('a').join(''),
    links: [{ type: 'provider', id: provider.id }],
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
    content: new Array(260).fill('a').join(''),
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

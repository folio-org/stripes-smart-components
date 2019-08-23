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
    links: [{ type: 'provider', id: provider.id }],
  });

  server.create('note', {
    type: generalNoteType.name,
    typeId: generalNoteType.id,
    links: [{ type: 'package', id: faker.random.uuid() }],
  });

  server.create('note', {
    type: generalNoteType.name,
    typeId: generalNoteType.id,
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

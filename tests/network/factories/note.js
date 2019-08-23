import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  title: () => faker.commerce.productName(),
  type: null,
  typeId: null,
  domain: 'dummy',
  content: faker.lorem.paragraph(),
  creator: {
    lastName: faker.name.lastName(),
    firstName: faker.name.firstName()
  },
  metadata: {
    createdDate: () => faker.date.past(2),
    createdByUserId: () => faker.random.uuid(),
    createdByUsername: () => faker.name.firstName(),
    updatedByUserId: () => faker.random.uuid(),
    updatedDate: () => faker.date.past(1),
  },
  links: [],
});

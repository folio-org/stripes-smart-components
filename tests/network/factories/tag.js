import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  label: () => faker.commerce.productName(),
  description: () => faker.company.bsBuzz,
  metadata: {
    createdDate: () => faker.date.past(2),
  }
});

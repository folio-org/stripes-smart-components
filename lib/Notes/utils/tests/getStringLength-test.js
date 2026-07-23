import {
  describe,
  it,
} from 'mocha';
import { expect } from 'chai';

import { getStringLength } from '..';
import { getString } from './helpers';

const htmlString = `<ul><li>${getString(50, 'b')}<b>${getString(50, 'c')}</b></li></ul>`;

describe('getStringLength', () => {
  it('should return characters length in DOM tree', () => {
    expect(getStringLength(htmlString)).to.equal(100);
  });
});

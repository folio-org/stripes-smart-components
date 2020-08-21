import {
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import { getHTMLSubstring } from '..';
import { getString } from './helpers';
import { DETAILS_CUTOFF_LENGTH } from '../../constants';

const inputStr = `<ul><li>${getString(200, 'a')}</li><li>${getString(50, 'b')}<b>${getString(50, 'c')}</b></li></ul>`;
const outputStr = `<ul><li>${getString(200, 'a')}</li><li>${getString(50, 'b')}<b>${getString(5, 'c')}</b></li></ul>`;

describe('getHTMLSubstring', () => {
  it('should return HTML string if input string more than certain length', () => {
    expect(getHTMLSubstring(inputStr, DETAILS_CUTOFF_LENGTH)).to.equal(outputStr);
  });
});

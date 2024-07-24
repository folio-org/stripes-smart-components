import {
  describe,
  it,
} from 'mocha';
import { expect } from 'chai';

import StripesConnectedSource from '../ConnectedSource/StripesConnectedSource';
import { REQUEST_URL_LIMIT } from '../requestUrlLimit';

describe('StripesConnectedSource', () => {
  describe('when a request URL is too long', () => {
    it('should display an error message', () => {
      expect(new StripesConnectedSource({ isRequestUrlExceededLimit: true }).failureMessage().props).to.deep.equal({
        id: 'stripes-smart-components.error.requestUrlLimit',
        values: {
          limit: REQUEST_URL_LIMIT,
        },
      });
    });
  });
});

import {
  describe,
  it,
} from 'mocha';
import { expect } from 'chai';

import StripesConnectedSource from '../ConnectedSource/StripesConnectedSource';
import { REQUEST_URL_LIMIT } from '../requestUrlLimit';

describe('StripesConnectedSource', () => {
  const logger = { log: () => {} };

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

  it('should return a specific 400 error message', () => {
    const query = 'www.itemcase.com/test/uri';

    const props = {
      parentResources: {
        records: {
          failed: {
            httpStatus: 400,
            message: 'foo',
          },
        },
        query: {
          query,
        },
      },
    };

    expect(new StripesConnectedSource(props, logger).failureMessage().props).to.deep.equal({
      id: 'stripes-smart-components.error.badRequest',
      values: {
        query,
      },
    });
  });

  it('should return a specific 422 error message', () => {
    const query = 'metadata.createdDate <= 123';

    const props = {
      parentResources: {
        records: {
          failed: {
            httpStatus: 422,
            message: 'foo',
          },
        },
        query: {
          query,
        },
      },
    };

    expect(new StripesConnectedSource(props, logger).failureMessage().props).to.deep.equal({
      id: 'stripes-smart-components.error.badRequest',
      values: {
        query,
      },
    });
  });
});

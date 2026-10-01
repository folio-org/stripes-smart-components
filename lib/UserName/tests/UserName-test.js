import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { HTML, including } from '@folio/stripes-testing';

import {
  mount,
  setupApplication
} from '../../../tests/helpers';

import UserName from '../UserName';

describe('UserName', () => {
  setupApplication();

  const renderComponent = (fieldProps = {}) => {
    return mount(
      <UserName
        {...fieldProps}
      />
    );
  };

  describe('when <firstName> and <lastName> are present', () => {
    beforeEach(async () => {
      renderComponent({
        id: '1',
        resources: {
          user: {
            hasLoaded: true,
            records: [{
              personal: {
                firstName: 'Test',
                lastName: 'User'
              }
            }]
          }
        }
      });
    });

    it('should properly display <lastName>, <firstName>', async () => {
      await HTML('User, Test').exists();
    });
  });

  describe('when only <lastName> is present', () => {
    beforeEach(() => {
      renderComponent({
        id: '1',
        resources: {
          user: {
            hasLoaded: true,
            records: [{
              personal: {
                lastName: 'User'
              }
            }]
          }
        }
      });
    });

    it('should only display <lastName>', async () => {
      await HTML('User').exists();
    });
  });

  describe('when only <firstName> is present', () => {
    const firstName = 'First';
    const username = 'barbenheimer';
    beforeEach(() => {
      renderComponent({
        id: '1',
        resources: {
          user: {
            hasLoaded: true,
            records: [{
              username,
              personal: {
                firstName,
              }
            }]
          }
        }
      });
    });

    it('should only display <username>', async () => {
      await HTML(username).exists();
    });
  });

  describe('when <personal> is absent', () => {
    const username = 'John Jacob Jingle Heimer Schmidt';
    beforeEach(() => {
      renderComponent({
        id: '1',
        resources: {
          user: {
            hasLoaded: true,
            records: [{
              username,
            }]
          }
        }
      });
    });

    it('should display <username>', async () => {
      await HTML(username).exists();
    });
  });

  describe('when no user is present', () => {
    beforeEach(() => {
      renderComponent({
        id: '1',
        resources: {
          user: {
            hasLoaded: true,
            records: []
          }
        }
      });
    });

    it('should return null', async () => {
      await HTML(including('User')).absent();
    });
  });
});

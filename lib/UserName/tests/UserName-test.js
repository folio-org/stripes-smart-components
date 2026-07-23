import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import {
  mount,
  setupApplication
} from '../../../tests/helpers';

import UserName from '../UserName';
import UserNameInteractor from './interactor';

describe('UserName', () => {
  setupApplication();

  const userName = new UserNameInteractor();

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

    it('should properly display <lastName>, <firstName>', () => {
      expect(userName.label.has({ text: 'User, Test' }));
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

    it('should only display <lastName>', () => {
      expect(userName.label.has({ text: 'User' }));
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

    it('should only display <username>', () => {
      expect(userName.label.has({ text: username }));
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

    it('should display <username>', () => {
      expect(userName.label.has({ text: username }));
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

    it('should return null', () => {
      expect(userName.label.has({ text: null }));
    });
  });
});

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

  describe('when no user is present', () => {
    beforeEach(() => {
      renderComponent({
        resources: {
          user: {
            hasLoaded: true
          }
        }
      });
    });

    it('should return null', () => {
      expect(userName.label.has({ text: null }));
    });
  });
});

import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import {
  mount,
  setupApplication,
  axe,
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

  let a11yResults = null;

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
      a11yResults = await axe.run();
    });

    it('should not have any a11y issues', () => {
      expect(a11yResults.violations).to.be.empty;
    });

    it('should properly display <lastName>, <firstName>', () => {
      expect(userName.Label.has({ text: 'User, Test' }));
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
      expect(userName.Label.has({ text: 'User' }));
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
      expect(userName.Label.has({ text: null }));
    });
  });
});

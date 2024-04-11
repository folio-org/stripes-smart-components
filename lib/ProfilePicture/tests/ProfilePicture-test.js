import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import {
  mount,
  setupApplication,
  axe
} from '../../../tests/helpers';

import ProfilePicture from '../ProfilePicture';
import ProfilePictureInteractor from './interactor';

describe('ProfilePicture', () => {
  setupApplication();

  const profilePictureInteractor = new ProfilePictureInteractor();

  const renderComponent = (fieldProps = {}) => {
    return mount(
      <ProfilePicture
        {...fieldProps}
      />
    );
  };

  let a11yResults = null;

  describe('render Profile Picture with profile picture UUID or URL', () => {
    beforeEach(async () => {
      await renderComponent({
        profilePictureSource: 'https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg'
      });
      a11yResults = await axe.run();
    });

    it('should not have any a11y issues', () => {
      if (a11yResults.violations.length) {
        // eslint-disable-next-line no-console
        console.warn(a11yResults.violations);
      }
      expect(a11yResults.violations).to.be.empty;
    });

    it('should render and display Profile Picture component with correct Props', () => {
      expect(profilePictureInteractor.profilePictureDiv).to.be.true;
    });
  });

  describe('render Profile Picture without profile picture UUID or URL', () => {
    beforeEach(async () => {
      await renderComponent({
        profilePictureSource: ''
      });
    });

    it('should render Profile Picture component', () => {
      expect(profilePictureInteractor.profilePictureDiv).to.be.true;
    });
  });
});

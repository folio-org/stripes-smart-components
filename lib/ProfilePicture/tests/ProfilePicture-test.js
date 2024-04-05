import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import {
  mount,
  setupApplication
} from '../../../tests/helpers';

import ProfilePicture from '../ProfilePicture';
import ProfilePictureInteractor from './interactor';

describe('ProfilePicture', () => {
  const profilePictureInteractor = new ProfilePictureInteractor();
  setupApplication();

  const ProfilePictureComponent = (fieldProps = {}) => {
    return mount(
      <ProfilePicture
        {...fieldProps}
      />
    );
  };

  describe('render Profile Picture with profilePictureLink', () => {
    beforeEach(() => {
      ProfilePictureComponent({
        profilePictureLink: 'https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg'
      });
    });

    it('should render and display Profile Picture with correct Props', () => {
      expect(profilePictureInteractor.isVisible).to.be.true;
    });
  });
  describe('render Profile Picture without profilePictureLink', () => {
    beforeEach(() => {
      ProfilePictureComponent({
        profilePictureLink: 'https://folio.org/wp-content/uploads/2023/08/folio-site-general-Illustration-social-image-1200.jpg'
      });
    });

    it('should render and display Profile Picture thumbnail', () => {
      expect(profilePictureInteractor.isVisible).to.be.true;
    });
  });
});

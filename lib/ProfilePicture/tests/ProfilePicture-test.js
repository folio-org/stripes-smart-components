import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import {
  HTML,
  runAxeTest
} from '@folio/stripes-testing';

import {
  mount,
  setupApplication,
} from '../../../tests/helpers';

import ProfilePicture from '../ProfilePicture';

const ProfilePictureInteractor = HTML.extend('profile picture')
  .selector('[data-test-profile-pic-div]');

describe('ProfilePicture', () => {
  setupApplication();

  const profilePicture = ProfilePictureInteractor();

  const renderComponent = (fieldProps = {}) => {
    return mount(
      <ProfilePicture
        {...fieldProps}
      />
    );
  };

  describe('render Profile Picture given URL', () => {
    beforeEach(async () => {
      await renderComponent({
        profilePictureLink: 'https://url-to/image.jpg'
      });
    });

    it('should not have any a11y issues', () => runAxeTest());

    it('should render and display Profile Picture component with correct Props', () => profilePicture.exists());
  });

  describe('render Profile Picture without profile picture UUID or URL', () => {
    beforeEach(async () => {
      await renderComponent({
        profilePictureLink: ''
      });
    });

    it('should render Profile Picture component', () => profilePicture.exists());
  });
});

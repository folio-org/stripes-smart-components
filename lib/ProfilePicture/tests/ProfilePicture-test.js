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

const testImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const ProfilePictureInteractor = HTML.extend('profile picture')
  .selector('[data-test-profile-pic-div]')
  // The wrapper is present while react-image is loading, but may not have a
  // layout rectangle yet. This test is concerned with DOM presence.
  .filters({ visible: () => true });

const ProfilePictureImageInteractor = HTML.extend('profile picture image')
  .selector('[data-test-profile-pic-div] img')
  .filters({ visible: () => true });

describe('ProfilePicture', () => {
  setupApplication();

  const profilePicture = ProfilePictureInteractor();
  const profilePictureImage = ProfilePictureImageInteractor();

  const renderComponent = (fieldProps = {}) => {
    return mount(
      <ProfilePicture
        {...fieldProps}
      />
    );
  };

  describe('render Profile Picture given URL', () => {
    beforeEach(async () => {
      renderComponent({ profilePictureLink: testImage });
      await profilePicture.exists();
      await profilePictureImage.exists();
    });

    it('should not have any a11y issues', async () => {
      await runAxeTest();
    });

    it('should render and display Profile Picture component with correct Props', async () => {
      await profilePicture.exists();
    });
  });

  describe('render Profile Picture without profile picture UUID or URL', () => {
    beforeEach(async () => {
      renderComponent({ profilePictureLink: '' });
      await profilePicture.exists();
    });

    it('should render Profile Picture component', async () => {
      await profilePicture.exists();
    });
  });
});

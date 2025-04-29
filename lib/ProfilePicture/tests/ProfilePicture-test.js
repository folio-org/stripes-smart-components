import React from 'react';
import { describe, beforeEach, afterEach, it } from 'mocha';
import sinon from 'sinon';
import {
  HTML,
  runAxeTest
} from '@folio/stripes-testing';

import {
  mount,
  setupApplication,
  wait,
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

  beforeEach(() => {
    const stub = sinon.stub(window, 'fetch');
    stub.onCall(0).returns(Promise.resolve(new window.Response(JSON.stringify({
      profile_picture_blob: 'blob',
    }), {
      status: 200,
      headers: {
        'Content-type': 'application/json'
      },
    })));
  });

  afterEach(() => {
    window.fetch.restore();
  });

  describe('render Profile Picture with profile picture UUID or URL', () => {
    beforeEach(async () => {
      await renderComponent({
        profilePictureLink: 'https://url-to/image.jpg'
      });
      await wait(200);
    });

    it('should not have any a11y issues', () => runAxeTest());

    // This test fails in CI, as the element may be present, but not visible.
    // It's dependably visible locally.
    it.skip('should render and display Profile Picture component with correct Props', () => profilePicture.exists());
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

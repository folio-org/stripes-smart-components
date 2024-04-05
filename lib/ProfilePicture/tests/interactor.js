import { interactor, isVisible, scoped } from '@bigtest/interactor';

export default interactor(class ProfilePictureInteractor {
  isVisible = isVisible();
  profilePictureSrc = scoped('[data-test-profile-picture-img]');
});

import { interactor, isPresent, isVisible } from '@bigtest/interactor';

export default interactor(class ProfilePictureInteractor {
  isVisible = isVisible();
  profilePictureDiv = isPresent('[data-test-profile-pic-div]');
});

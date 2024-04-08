import { interactor, isPresent } from '@bigtest/interactor';

export default interactor(class ProfilePictureInteractor {
  profilePictureDiv = isPresent('[data-test-profile-pic-div]');
});

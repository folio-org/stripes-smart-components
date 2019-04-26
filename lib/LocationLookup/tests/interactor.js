import {
  clickable,
  interactor,
  isPresent,
  property,
  selectable
} from '@bigtest/interactor';

export default interactor(class LocationLookupInteractor {
  isLookupButtonPresent = isPresent('[data-test-location-lookup-button]');
  isLookupFormPresent = isPresent('form#location-form')
  lookupButton = clickable('[data-test-location-lookup-button]');

  lookupForm = isPresent('form#location-form')
  institution = selectable('select[name=institutionIdddd]');
  campus = selectable('select[name="institutionId"]');
  library = selectable('select[name="institutionId"]');
  location = selectable('select[name="institutionId"]');

  campusDisabled = property('select[name="institutionId"]', 'disabled');
  libraryDisabled = property('select[name="institutionId"]', 'disabled');
  locationDisabled = property('select[name="institutionId"]', 'disabled');

  institutionCount = property('select[name=institutionId]', 'length');
  campusCount = property('select[name="institutionId"]', 'length');
  libraryCount = property('select[name="institutionId"]', 'length');
  locationCount = property('select [name="institutionId"]', 'length');
});

import {
  clickable,
  collection,
  count,
  interactor,
  isPresent,
  property,
  selectable,
  text
} from '@bigtest/interactor';

export default interactor(class LocationLookupInteractor {
  isLookupButtonPresent = isPresent('[data-test-location-lookup-button]');
  isLookupFormPresent = isPresent('form#location-form')
  clickLookupButton = clickable('[data-test-location-lookup-button]');
  clickSaveButton = clickable('[data-test-button-save]');

  lookupForm = isPresent('form#location-form')
  selectInstitution = selectable('select[name=institutionId]');
  selectCampus = selectable('select[name="campusId"]');
  selectLibrary = selectable('select[name="libraryId"]');

  clickLocation = clickable('button[name="locationId"]');
  locations = collection('#sl-locationId li');

  locationValue = text('#selected-locationId-item');

  campusDisabled = property('select[name="campusId"]', 'disabled');
  libraryDisabled = property('select[name="libraryId"]', 'disabled');
  locationDisabled = property('button[name="locationId"]', 'disabled');
  saveDisabled = property('[data-test-button-save]', 'disabled');

  institutionCount = property('select[name="institutionId"]', 'length');
  campusCount = property('select[name="campusId"]', 'length');
  libraryCount = property('select[name="libraryId"]', 'length');
  locationCount = count('sl-locationId li');

  firstCampus = text('select[name="campusId"] option:nth-of-type(1)');
  firstLibrary = text('select[name="libraryId"] option:nth-of-type(1)');
  firstLocation = text('button[name="locationId"] option:nth-of-type(1)');
});

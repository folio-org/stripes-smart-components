import {
  interactor,
  text,
} from '@bigtest/interactor';

export default interactor(class ReferredRecordInteractor {
  static defaultScope = '[class*=kvRoot---]';

  referredEntityType = text('[data-test-referred-entity-type]');
  referredEntityName = text('[data-test-referred-entity-name]');
});

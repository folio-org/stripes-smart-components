import { interactor } from '@bigtest/interactor';
import { Label as LabelInteractor } from '@folio/stripes-testing';

export default interactor(class UserNameInteractor {
  label = new LabelInteractor();
});

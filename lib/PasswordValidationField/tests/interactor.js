import { interactor } from '@bigtest/interactor';
import { TextField as TextFieldInteractor } from '@folio/stripes-testing';

export default interactor(class PasswordValidationFieldInteractor {
  TextField = new TextFieldInteractor();
});

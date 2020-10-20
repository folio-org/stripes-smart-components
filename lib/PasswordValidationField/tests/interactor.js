import { attribute, interactor } from '@bigtest/interactor';
import formCss from '@folio/stripes-components/lib/sharedStyles/form.css';
import { selectorFromClassnameString } from '@folio/stripes-components/tests/helpers';
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor';

const errorClass = selectorFromClassnameString(`.${formCss.feedbackError}`);

export default interactor(class PasswordValidationFiledInteractor {
  TextField = new TextFieldInteractor();
  inputErrorType = attribute(`${errorClass} span`, 'data-test-invalid-password');
});

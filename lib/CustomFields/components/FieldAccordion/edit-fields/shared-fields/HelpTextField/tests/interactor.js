import {
  interactor,
  isPresent,
} from '@bigtest/interactor';
import { TextField as TextFieldInteractor } from '@folio/stripes-testing';

export default interactor(class HelpTextField {
  inputFill = TextFieldInteractor();
  fillAndBlur(value) {
    return this.inputFill.fillIn(value).then(this.inputFill.blur());
  }

  whenLoaded() {
    return this.when(() => isPresent('[data-test-custom-fields-help-text-input]'));
  }
});

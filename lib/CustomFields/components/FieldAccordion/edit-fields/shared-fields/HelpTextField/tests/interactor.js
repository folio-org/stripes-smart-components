import {
  interactor,
  fillable,
  blurrable,
  text,
  isPresent,
} from '@bigtest/interactor';

export default interactor(class HelpTextField {
  inputFill = fillable('[class^="textField--"] input[type="text"]');
  inputBlur = blurrable('[class^="textField--"] input[type="text"]');
  fillAndBlur(value) {
    return this.inputFill(value).inputBlur();
  }

  errorMessage = text('[class^="feedbackError--"]');
  errorMessagePresent = isPresent('[class^="feedbackError--"]');
});

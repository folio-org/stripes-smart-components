import {
  interactor,
  fillable,
  collection,
  clickable,
  value,
  is,
  text,
  blurrable,
  isPresent,
} from '@bigtest/interactor';

export default interactor(class OptionsField {
  rows = collection('[class^=mclRow--', {
    labelInput: fillable('input[type="text"]'),
    labelBlur: blurrable('input[type="text"]'),
    labelFillAndBlur(label) {
      return this.labelInput(label).labelBlur();
    },
    labelValue: value('input[type="text"]'),
    checkDefaultCheckbox: clickable('input[type="checkbox"]'),
    defaultChecked: is('input[type="checkbox"]', ':checked'),
    checkDefaultRadio: clickable('input[type="radio"]'),
    defaultRadioChecked: is('input[type="radio"]', ':checked'),
    errorMessage: text('[class^="feedbackError--"]'),
  });

  addOption = clickable('[class*="addOptionButton--"]');
  addOptionButtonIsPresent = isPresent('[class*="addOptionButton--"]');
  maxOptionsNumberReachedMessage = text('[class^="maxOptionsNumberReached--"]');
  optionsLeftMessage = text('[class^="optionsLeftMessage--"]');
});

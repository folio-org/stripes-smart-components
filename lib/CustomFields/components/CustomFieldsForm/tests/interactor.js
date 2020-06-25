import {
  interactor,
  isPresent,
  collection,
  value,
  fillable,
  focusable,
  blurrable,
  clickable,
  is,
  scoped,
  text,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor';
import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';
import ExpandAllButtonInteractor from '@folio/stripes-components/lib/Accordion/tests/expand-all-button-interactor';
import AddButtonInteractor from '../components/AddButton/tests/interactor';
import DeleteModalInteractor from '../components/DeleteModal/tests/interactor';
import DraggableAccordionInteractor from './DraggableAccordionInteractor';

export default interactor(class CustomFieldsFormInteractor {
  formIsPresent = isPresent('[class^=custom-fields-form--]');
  sectionTitleValue = value('[data-test-custom-fields-section-title]');
  sectionTitleField = fillable('[data-test-custom-fields-section-title]');
  focusSectionTitle = focusable('[data-test-custom-fields-section-title]');
  blurSectionTitle = blurrable('[data-test-custom-fields-section-title]');

  fillSectionTitle(sectionTitle) {
    return this.focusSectionTitle().sectionTitleField(sectionTitle).blurSectionTitle();
  }

  clickSaveButton = clickable('[data-test-custom-fields-save-button]');
  saveButtonIsDisabled = is('[data-test-custom-fields-save-button]', ':disabled');
  clickCancelButton = clickable('[data-test-custom-fields-cancel-button]');
  cancelButtonIsDisabled = is('[data-test-custom-fields-cancel-button]', ':disabled');

  addButton = new AddButtonInteractor();
  customFieldSelectButtons = collection('[data-test-add-custom-field-button]', ButtonInteractor);
  customFieldAccordions = collection('[data-test-accordion-section]', AccordionInteractor);
  expandAllButton = new ExpandAllButtonInteractor('#edit-custom-fields-pane-content');

  deleteModal = new DeleteModalInteractor();

  draggableAccordion = scoped('#field_1', DraggableAccordionInteractor);

  log = text('[role="log"]');

  moveAccordionDown() {
    return this.draggableAccordion.focus()
      .draggableAccordion.pressSpace()
      .whenFieldLifted()
      .draggableAccordion.pressArrowDown()
      .whenFieldMoved()
      .draggableAccordion.pressSpace()
      .whenFieldDropped();
  }

  moveAccordionUp() {
    return this.draggableAccordion.focus()
      .draggableAccordion.pressSpace()
      .whenFieldLifted()
      .draggableAccordion.pressArrowUp()
      .whenFieldMoved()
      .draggableAccordion.pressSpace()
      .whenFieldDropped();
  }

  whenFieldLifted() {
    return this.when(() => !!this.log.match(/You have lifted field/i));
  }

  whenFieldMoved() {
    return this.when(() => !!this.log.match(/You have moved field [a-zA-Z0-9\s]+ to position \d+/i));
  }

  whenFieldDropped() {
    return this.when(() => !!this.log.match(/You have moved field [a-zA-Z0-9\s]+ from position \d+ to position \d+/i));
  }

  whenLoaded() {
    return this.when(() => this.formIsPresent).timeout(500);
  }
});

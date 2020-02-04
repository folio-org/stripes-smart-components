import {
  interactor,
  collection,
  Interactor,
  scoped,
  isPresent,
  clickable,
  text,
} from '@bigtest/interactor';

@interactor class ProhibitDeleteModal {
  defaultScope = '#prohibit-item-delete';

  closeButton = scoped('[data-test-prohibit-delete-modal-close-button] button');
  message = scoped('[data-test-prohibit-delete-modal-message]');
}

@interactor class ActionsDropdown {
  edit = scoped('#dropdown-clickable-edit-item');
  delete = scoped('#dropdown-clickable-delete-item');
  duplicate = scoped('#dropdown-clickable-duplicate-item');

  whenDeleteLoaded() {
    return this.when(() => this.delete.isPresent);
  }
}

@interactor class DetailsSection {
  defaultScope = '[data-test-detail-section]';

  actionsButton = new Interactor('button[data-test-pane-header-actions-button]');
  actionsDropdown = new ActionsDropdown();
  editItemButton = scoped('#clickable-edit-item');

  whenLoaded() {
    return this.when(() => this.isPresent);
  }
}

@interactor class NavList {
  defaultScope = '[data-test-nav-list]';

  items = collection('[data-test-nav-list-item] a')
}

@interactor class EntryForm {
  defaultScope = '[data-test-entry-form]';

  entryFormSave = clickable('[data-test-entry-form-save]');
}

@interactor class CalloutElement {
  defaultScope = '[data-test-callout-element]';
  errorMessage = text('[data-test-callout-element]');
}

export default interactor(class EntryManagerInteractor {
  defaultScope = '[data-test-entry-manager]';

  newItemButton = scoped('#clickable-create-entry');
  prohibitDeleteModal = new ProhibitDeleteModal();
  isProhibitDeleteModalOpen = isPresent('#prohibit-item-delete');
  navList = new NavList();
  detailsSection = new DetailsSection();
  entryForm = new EntryForm();

  calloutElement = new CalloutElement();
});

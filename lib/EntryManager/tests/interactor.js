import {
  interactor,
  collection,
  Interactor,
  scoped,
  isPresent,
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

  actionsButton = new Interactor('button[class^="paneHeaderCenterButton--"]');
  actionsDropdown = new ActionsDropdown();

  whenLoaded() {
    return this.when(() => this.isPresent);
  }
}

@interactor class NavList {
  defaultScope = '[data-test-nav-list]';

  items = collection('[data-test-nav-list-item] a')
}

export default interactor(class EntryManagerInteractor {
  defaultScope = '[data-test-entry-manager]';

  prohibitDeleteModal = new ProhibitDeleteModal();
  isProhibitDeleteModalOpen = isPresent('#prohibit-item-delete');
  navList = new NavList();
  detailsSection = new DetailsSection();
});

import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from 'mocha';
import {
  Button,
  EntryManager,
  EntryDetails,
  Dropdown,
  Modal,
  NavList,
  including,
} from '@folio/stripes-testing';

import {
  setupApplication,
  mount,
} from '../../../tests/helpers';

import {
  ConnectedComponent,
  paneTitle,
  entryList,
  permissions,
  detailComponent,
  entryFormComponent,
  prohibitItemDelete,
  entryLabel,
  isEntryInUse,
} from './constants';

const EntryManagerInteractor = EntryManager.extend('local entry manager')
  .actions({
    clickDeleteAction: async ({ find }) => {
      await find(Dropdown(including('Actions'))).choose('Delete');
    }
  });

const EntryDetailsInteractor = EntryDetails.extend('local entry details');

const ProhibitDeleteModalInteractor = Modal.extend('prohibit delete modal')
  .actions({
    clickClose: async ({ find }) => find(Button('close')).click()
  });

describe('prohibit item delete modal', () => {
  const entryManager = EntryManagerInteractor();
  const entryDetails = EntryDetailsInteractor();
  const deleteModal = ProhibitDeleteModalInteractor();
  describe('prohibit item delete', () => {
    setupApplication();

    beforeEach(() => {
      mount(
        <ConnectedComponent
          nameKey="test"
          paneTitle={paneTitle}
          entryList={entryList}
          entryLabel={entryLabel}
          enableDetailsActionMenu
          permissions={permissions}
          isEntryInUse={isEntryInUse}
          detailComponent={detailComponent}
          entryFormComponent={entryFormComponent}
          prohibitItemDelete={prohibitItemDelete}
        />
      );
    });

    describe('EntryManager', () => {
      it('should be presented', () => entryManager.exists());

      describe('nav list', () => {
        it('should have the proper amount of links', () => NavList().has({ count: 3 }));

        describe('first item select', () => {
          beforeEach(async () => {
            await entryManager.navTo('test');
          });

          describe('details section', () => {
            it('should be presented', () => entryDetails.exists());

            describe('item deletion prohibit modal', () => {
              beforeEach(async () => {
                await entryManager.clickDeleteAction();
              });

              it('should be presented', () => deleteModal.exists());

              it('should have proper message', () => deleteModal.has({ message: prohibitItemDelete.message }));

              describe('close button click', () => {
                beforeEach(async () => {
                  await deleteModal.clickClose();
                });

                it('item deletion prohibit modal should not be presented', () => deleteModal.absent());
              });
            });
          });
        });
      });
    });
  });

  describe('allow item deletion', () => {
    setupApplication();

    beforeEach(() => {
      mount(
        <ConnectedComponent
          nameKey="test"
          paneTitle={paneTitle}
          entryList={entryList}
          entryLabel={entryLabel}
          enableDetailsActionMenu
          permissions={permissions}
          detailComponent={detailComponent}
          entryFormComponent={entryFormComponent}
          prohibitItemDelete={prohibitItemDelete}
        />
      );
    });

    describe('EntryManager', () => {
      it('should be presented', () => entryManager.exists());

      describe('nav list', () => {
        it('should have proper amount of items', () => NavList().has({ count: entryList.length }));

        describe('first item select', () => {
          beforeEach(async () => {
            await entryManager.navTo('test');
          });

          describe('details section', () => {
            it('should be presented', () => entryDetails.exists());

            describe('item deletion prohibit modal', () => {
              beforeEach(async () => {
                await entryManager.clickDeleteAction;
              });

              it('should not be presented', () => deleteModal.absent());
            });
          });
        });
      });
    });
  });
});

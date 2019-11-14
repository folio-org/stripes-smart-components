import React from 'react';
import { expect } from 'chai';
import { beforeEach, describe, it } from '@bigtest/mocha';
import { mount, setupApplication } from '../../../tests/helpers';

import EntryManagerInteractor from './interactor';
import {
  ConnectedComponent,
  paneTitle,
  entryList,
  permissions,
  detailComponent,
  entryFormComponent,
  prohibitItemDelete,
  entryLabel,
} from './constants';

const entryManagerInteractor = new EntryManagerInteractor();

describe('entry manager', () => {
  setupApplication();
  beforeEach(() => {
    mount(
      <ConnectedComponent
        nameKey="test"
        paneTitle={paneTitle}
        entryList={entryList}
        entryLabel={entryLabel}
        enableDetailsActionMenu
        parentMutator={
          {
            entries: {
              POST: () => new Promise((resolve) => {
                resolve();
              })
            }
          }}
        permissions={permissions}
        detailComponent={detailComponent}
        entryFormComponent={entryFormComponent}
        prohibitItemDelete={prohibitItemDelete}
      />
    );
  });

  describe('EntryManager', () => {
    it('should be presented', () => {
      expect(entryManagerInteractor.isPresent).to.be.true;
    });

    describe('nav list', () => {
      it('should be presented', () => {
        expect(entryManagerInteractor.navList.isPresent).to.be.true;
      });

      it('should have proper amount of items', () => {
        expect(entryManagerInteractor.navList.items().length).to.equal(entryList.length);
      });

      describe('add new item', () => {
        beforeEach(async () => {
          await entryManagerInteractor.newItemButton.click();
        });

        it('entry form should be presented', () => {
          expect(entryManagerInteractor.entryForm.isPresent).to.be.true;
        });

        describe('error callout', () => {
          beforeEach(async () => {
            await entryManagerInteractor.entryForm.entryFormSave();
          });

          it('callout should be shown', () => {
            expect(entryManagerInteractor.calloutElement.isPresent).to.be.true;
          });

          it('callout should display error message', () => {
            // eslint-disable-next-line max-len
            expect(entryManagerInteractor.calloutElement.errorMessage).to.equal('Cannot read property \'id\' of undefined');
          });
        });
      });

      describe('first item select', () => {
        beforeEach(async () => {
          await entryManagerInteractor.navList.items(0).click();
          await entryManagerInteractor.detailsSection.whenLoaded();
        });

        describe('details section', () => {
          it('should be presented', () => {
            expect(entryManagerInteractor.detailsSection.isPresent).to.be.true;
          });

          it('actions bbutton should be presented', () => {
            expect(entryManagerInteractor.detailsSection.actionsButton.isPresent).to.be.true;
          });

          describe('item edit button click', () => {
            beforeEach(async () => {
              await entryManagerInteractor.detailsSection.editItemButton.click();
            });

            it('entry form should be presented', () => {
              expect(entryManagerInteractor.entryForm.isPresent).to.be.true;
            });
          });

          describe('actions dropdown', () => {
            describe('item edit', () => {
              beforeEach(async () => {
                await entryManagerInteractor.detailsSection.actionsButton.click();
                await entryManagerInteractor.detailsSection.actionsDropdown.whenDeleteLoaded();
                await entryManagerInteractor.detailsSection.actionsDropdown.edit.click();
              });

              it('entry form should be presented', () => {
                expect(entryManagerInteractor.entryForm.isPresent).to.be.true;
              });
            });

            describe('item duplication', () => {
              beforeEach(async () => {
                await entryManagerInteractor.detailsSection.actionsButton.click();
                await entryManagerInteractor.detailsSection.actionsDropdown.whenDeleteLoaded();
                await entryManagerInteractor.detailsSection.actionsDropdown.duplicate.click();
              });

              it('entry form should be presented', () => {
                expect(entryManagerInteractor.entryForm.isPresent).to.be.true;
              });
            });
          });

          describe('item deletion prohibit modal', () => {
            beforeEach(async () => {
              await entryManagerInteractor.detailsSection.actionsButton.click();
              await entryManagerInteractor.detailsSection.actionsDropdown.whenDeleteLoaded();
              await entryManagerInteractor.detailsSection.actionsDropdown.delete.click();
            });

            it('should not be presented', () => {
              expect(entryManagerInteractor.isProhibitDeleteModalOpen).to.be.false;
            });
          });
        });
      });
    });
  });
});

describe('entry manager', () => {
  setupApplication();
  beforeEach(() => {
    mount(
      <ConnectedComponent
        nameKey="test"
        paneTitle={paneTitle}
        entryList={entryList}
        entryLabel={entryLabel}
        enableDetailsActionMenu
        parentMutator={
          {
            entries: {
              POST: () => new Promise((resolve) => {
                resolve();
              })
            }
          }}
        permissions={permissions}
        detailComponent={detailComponent}
        entryFormComponent={entryFormComponent}
        prohibitItemDelete={prohibitItemDelete}
      />
    );
  });
});

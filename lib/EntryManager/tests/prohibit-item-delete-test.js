import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import EntryManager from '../EntryManager';
import EntryManagerInteractor from './interactor';
import {
  setupApplication,
  mount,
} from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';

const ConnectedComponent = connectStripes(EntryManager);
const detailComponent = () => <div data-test-detail-section>detailComponent</div>;
const entryLabel = <div>entryLabel</div>;
const entryList = [
  {
    id: 1,
    name: 'test',
    test: 'test',
  },
  {
    id: 2,
    name: 'test1',
    test: 'test1',
  },
  {
    id: 3,
    name: 'test2',
    test: 'test2',
  },
];

const prohibitItemDelete = {
  close: 'close',
  label: 'label',
  message: 'message',
};

const permissions = {
  put: 'test',
  post: 'test',
  delete: 'test',
};
const entryFormComponent = () => <div>entryFormComponent</div>;
const paneTitle = <div>paneTitle</div>;
const isEntryInUse = () => true;
const entryManagerInteractor = new EntryManagerInteractor();

describe.only('prohibit item delete', () => {
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

          describe('item deletion prohibit modal', () => {
            beforeEach(async () => {
              await entryManagerInteractor.detailsSection.actionsButton.click();
              await entryManagerInteractor.detailsSection.actionsDropdown.whenDeleteLoaded();
              await entryManagerInteractor.detailsSection.actionsDropdown.delete.click();
            });

            it('should be presented', () => {
              expect(entryManagerInteractor.isProhibitDeleteModalOpen).to.be.true;
            });

            it('should have proper message', () => {
              expect(entryManagerInteractor.prohibitDeleteModal.message.text).to.equal(prohibitItemDelete.message);
            });

            it('should have proper close button text', () => {
              expect(entryManagerInteractor.prohibitDeleteModal.closeButton.text).to.equal(prohibitItemDelete.close);
            });

            describe('close button click', () => {
              beforeEach(async () => {
                await entryManagerInteractor.prohibitDeleteModal.closeButton.click();
              });

              it('item deletion prohibit modal should not be presented', () => {
                expect(entryManagerInteractor.isProhibitDeleteModalOpen).to.be.false;
              });
            });
          });
        });
      });
    });
  });
});

import React from 'react';
import { beforeEach, describe, it } from 'mocha';
import { Response } from 'miragejs';
import {
  EntryManager as Interactor,
  NavList,
  EntryForm,
  Callout,
  EntryDetails,
  Button,
  Modal,
  converge,
} from '@folio/stripes-testing';
import { mount, setupApplication } from '../../../tests/helpers';

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

const entryManagerInteractor = Interactor();

function mountErr(response) {
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
            POST: () => Promise.reject(response)
          }
        }}
      permissions={permissions}
      detailComponent={detailComponent}
      entryFormComponent={entryFormComponent}
      prohibitItemDelete={prohibitItemDelete}
    />
  );
}

describe('Entry Manager', () => {
  describe('entry manager with action menu', () => {
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
                POST: () => Promise.resolve()
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
      it('should be presented', () => entryManagerInteractor.exists());

      describe('nav list', () => {
        it('should be presented', () => NavList().exists());

        it('should have proper amount of items', () => NavList().has({ count: entryList.length }));

        describe('add new item', () => {
          beforeEach(async () => {
            await entryManagerInteractor.createEntry();
          });

          it('entry form should be presented', () => EntryForm().exists());

          describe('error callout', () => {
            beforeEach(async () => {
              await EntryForm().save();
            });

            it('callout should be shown', () => Callout().exists());
          });
        });

        describe('first item select', () => {
          beforeEach(async () => {
            await entryManagerInteractor.navTo(entryList[0].name);
            await converge(() => EntryDetails().exists());
          });

          describe('details section', () => {
            it('actions button should be presented', () => Button('Actions').exists());

            describe('actions dropdown', () => {
              describe('item edit', () => {
                beforeEach(async () => {
                  await Button('Actions').click();
                  await Button('Edit').click();
                });

                it('entry form should be presented', () => EntryForm().exists());
              });

              describe('item duplication', () => {
                beforeEach(async () => {
                  await Button('Actions').click();
                  await Button('Duplicate').click();
                });

                it('entry form should be presented', () => EntryForm().exists());
              });
            });

            describe('item deletion prohibit modal', () => {
              beforeEach(async () => {
                await Button('Actions').click();
                await Button('Delete').click();
              });

              it('should not be presented', () => Modal('Delete entryLabel').exists());
            });
          });
        });
      });
    });
  });

  describe('entry manager without action menu', () => {
    setupApplication();

    beforeEach(() => {
      mount(
        <ConnectedComponent
          nameKey="test"
          paneTitle={paneTitle}
          entryList={entryList}
          entryLabel={entryLabel}
          enableDetailsActionMenu={false}
          parentMutator={
            {
              entries: {
                POST: () => Promise.resolve()
              }
            }}
          permissions={permissions}
          detailComponent={detailComponent}
          entryFormComponent={entryFormComponent}
          prohibitItemDelete={prohibitItemDelete}
        />
      );
    });

    describe('item edit button click', () => {
      beforeEach(async () => {
        await entryManagerInteractor.navTo(entryList[0].name);
        await converge(() => EntryDetails().exists());
        await Button('Edit').click();
      });

      it('entry form should be presented', () => EntryForm().exists());
    });
  });

  describe('entry manager detail section with edit button disabled', () => {
    setupApplication({
      permissions: {
        'test': false,
        'module.ui-dummy.enabled': true,
      },
      stripesConfig: {
        hasAllPerms: false,
      }
    });

    beforeEach(() => {
      mount(
        <ConnectedComponent
          nameKey="test"
          paneTitle={paneTitle}
          entryList={entryList}
          entryLabel={entryLabel}
          enableDetailsActionMenu={false}
          parentMutator={
            {
              entries: {
                POST: () => Promise.resolve()
              }
            }}
          permissions={permissions}
          detailComponent={detailComponent}
          entryFormComponent={entryFormComponent}
          prohibitItemDelete={prohibitItemDelete}
        />
      );
    });

    describe('item edit button to exist and be disabled', () => {
      beforeEach(async () => {
        await entryManagerInteractor.navTo(entryList[0].name);
        await converge(() => EntryDetails().exists());
      });

      it('edit button should be disabled', () => Button({ text: 'Edit', disabled: true }).exists());
    });
  });

  describe('Test 422 error', () => {
    const resp422 = new Response();

    resp422.status = 422;
    resp422.json = () => {
      return {
        'errors': [{
          'message': 'Cannot create entity; name is not unique',
          'code': 'name.duplicate'
        }]
      };
    };
    setupApplication({ scenarios: ['entry-manager-dublication-error'] });
    beforeEach(async () => {
      mountErr(resp422);
      await entryManagerInteractor.createEntry();
    });

    describe('error callout', () => {
      beforeEach(async () => {
        await EntryForm().save();
      });

      it('callout should be shown', () => Callout().exists());

      it('callout should display error message', () => Callout('Cannot create entity; name is not unique').exists());
    });
  });

  describe('Test 400 error', () => {
    const resp400 = new Response();

    resp400.status = 400;
    resp400.statusText = '400 Bad Request';
    setupApplication({ scenarios: ['controlled-vocab-default-error'] });
    beforeEach(async () => {
      mountErr(resp400);
      await entryManagerInteractor.createEntry();
    });

    describe('error callout', () => {
      beforeEach(async () => {
        await EntryForm().save();
      });

      it('callout should be shown', () => Callout().exists());

      it('callout should display error message', () => Callout('400 Bad Request').exists());
    });
  });
});

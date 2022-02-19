import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import {
  // AddressList as AddressListInteractor,
  // AddressEdit,
  Bigtest,
  Button,
  TextField,
  converge,
} from '@folio/stripes-testing';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import AddressEditList from '../AddressEdit/AddressEditList';
import AddressList from '../AddressList';
import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';
import TestForm from '../../../tests/TestForm';

const ConnectedComponent = connectStripes(AddressList);

// local interactor for convenience...

export const AddressEdit = Bigtest.HTML.extend('address edit')
  .selector('fieldset[data-test-address-edit]')
  .locator((el) => el.id.replace('addressEdit-', ''))
  .filters({
    index: (el) => [...el.closest('ul').querySelectorAll('fieldset[data-test-address-edit]')].indexOf(el),
    error: (el) => Boolean(el.querySelector('[aria-invalid]'))
  })
  .actions({
    cancel: ({ find }) => find(Button(/cancel/i)).click(),
    save: ({ find }) => find(Button(/save/i)).click(),
    delete: ({ find }) => find(Button(/remove/i)).click()
  });

export const AddressItem = Bigtest.HTML.extend('address item')
  .selector('[role=tabpanel]')
  .filters({
    index: (el) => [...el.parentElement.children].indexOf(el),
  })
  .actions({
    edit: ({ find }) => find(Button(/edit/i)).click(),
  });


export const AddressListInteractor = Bigtest.HTML.extend('address list')
  .selector('[data-test-address-list-container]')
  .filters({
    count: (el) => el.querySelectorAll('[role=tabpanel]').length - 1,
  })
  .actions({
    toggleMore: ({ find }) => find(Button(Bigtest.including('Show'))).click(),
    clickEdit: ({ find }, index) => find(AddressItem({ index })).edit(),
    addAddress: ({ find }) => find(Button('New')).click(),
    deleteAddress: ({ find }, index) => find(AddressEdit({ index })).delete()
  });

const addressList = AddressListInteractor();

describe.only('Address List', () => {
  setupApplication();
  const testAddress = 'test';
  let handleSubmitEditCalled = false;
  const handleSubmitEdit = () => { handleSubmitEditCalled = true; };
  const addresses = [{ id: 1, addressType: testAddress }, { id: 2, addressType: 'test2' }];

  beforeEach(() => {
    mount(
      <ConnectedComponent
        form="1"
        key="test"
        uiId="1"
        onSubmit={handleSubmitEdit}
        canDelete
        canEdit
        addresses={addresses}
      />
    );
  });

  it('renders', () => AddressListInteractor().exists());

  it('displays only a single address', async () => {
    await AddressListInteractor().has({ count: 1 });
  });

  describe('expanding the list', () => {
    beforeEach(async () => {
      await AddressListInteractor().toggleMore();
    });

    it('displays two addresses', async () => {
      await AddressListInteractor().has({ count: 2 });
    });
  });

  describe('adding a new address', () => {
    beforeEach(async () => {
      await AddressListInteractor().addAddress();
    });

    it('displays the edit form', async () => {
      await AddressEdit().exists();
    });

    describe('filling the address', () => {
      beforeEach(async () => {
        await TextField('Country').fillIn('Albania');
        await TextField('City').fillIn('Tirana');
        await TextField('Address line 1').fillIn('Rruga Nacionale Dajt, Surrel 221,');
      });

      describe('validation', () => {
        beforeEach(async () => {
          await AddressEdit().save();
        });

        it('displays validation error (no address type)', async () => {
          await TextField('Address Type').has({ error: 'Address type is required' });
        });
      });

      describe('cancel', () => {
        beforeEach(async () => {
          await AddressEdit().cancel();
        });

        it('removes address form', () => {
          AddressEdit().absent();
        });
      });

      describe('submission', () => {
        beforeEach(async () => {
          await TextField('Address Type').fillIn('test type');
          await AddressEdit().save();
        });

        it('calls the submit handler', () => {
          converge(() => handleSubmitEditCalled);
        });
      });
    });
  });

  describe('editing the address', () => {
    beforeEach(async () => {
      await addressList.clickEdit(0);
    });

    it('displays the edit form', async () => {
      await AddressEdit().exists();
    });

    describe('cancel edit', () => {
      beforeEach(async () => {
        await AddressEdit().cancel();
      });

      it('removes the edit form', async () => {
        await AddressEdit().absent();
      });
    });

    describe('save edits', () => {
      beforeEach(async () => {
        await AddressEdit().save();
      });

      it('calls the submit handler', async () => {
        await converge(() => handleSubmitEditCalled);
      });
    });
  });
});

describe('Address Edit - React-final-form', () => {
  setupApplication();
  let added = false;
  let deleted = false;
  beforeEach(async () => {
    const addresses = [{ id: 1, city: 'Baltimore' }];
    await mount(
      <FinalForm mutators={{ ...arrayMutators }} onSubmit={() => {}} initialValues={{ addresses }}>
        {() => (
          <>
            <AddressEditList
              formType="final-form"
              name="addresses"
              canDelete
              onAdd={() => { added = true; }}
              onDelete={() => { deleted = true; }}
            />
          </>
        )}
      </FinalForm>
    );
  });

  it('renders', () => { AddressEdit().exists(); });

  it('has a single address', () => {
    AddressListInteractor().has({ count: 1 });
  });

  describe('add address', () => {
    beforeEach(async () => {
      added = false;
      await Button('Add address').click();
    });

    it('adds a new form', () => {
      AddressListInteractor().has({ count: 2 });
    });

    it('calls the add handler', () => {
      converge(() => added);
    });

    describe('delete address', () => {
      beforeEach(async () => {
        deleted = false;
        await AddressListInteractor().deleteAddress(1);
      });

      it('has a single address', () => {
        AddressListInteractor().has({ count: 1 });
      });

      it('calls the delete handler', () => {
        converge(() => deleted);
      });
    });
  });
});

describe('Address Edit - Redux-form', () => {
  setupApplication();
  let added = false;
  let deleted = false;
  beforeEach(async () => {
    const addresses = [{ id: 1, city: 'Baltimore' }];
    added = false;
    deleted = false;
    await mount(
      <TestForm initialValues={{ addresses }}>
        <AddressEditList
          name="addresses"
          canDelete
          onAdd={() => { added = true; }}
          onDelete={() => { deleted = true; }}
        />
      </TestForm>
    );
  });

  it('renders', () => { AddressEdit().exists(); });

  it('has a single address', () => {
    AddressListInteractor().has({ count: 1 });
  });

  describe('add address', () => {
    beforeEach(async () => {
      await Button('Add address').click();
    });

    it('adds a new form', () => {
      AddressListInteractor().has({ count: 2 });
    });

    it('calls the add handler', () => {
      converge(() => added);
    });

    describe('delete address', () => {
      beforeEach(async () => {
        await AddressListInteractor().deleteAddress(1);
      });

      it('has a single address', () => {
        AddressListInteractor().has({ count: 1 });
      });

      it('calls the delete handler', () => {
        converge(() => deleted);
      });
    });
  });
});


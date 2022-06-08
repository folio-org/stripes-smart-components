import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import {
  AddressList as AddressListInteractor,
  AddressEdit,
  Button,
  TextField,
  converge,
} from '@folio/stripes-testing';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import AddressEditList from '../AddressEdit/AddressEditList';
import AddressList from '../AddressList';
import { setupApplication } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';
import TestForm from '../../../tests/TestForm';

const ConnectedComponent = connectStripes(AddressList);
const addressList = AddressListInteractor();

describe('Address List', () => {
  const testAddress = 'test';
  let handleSubmitEditCalled = false;
  const handleSubmitEdit = () => { handleSubmitEditCalled = true; };
  let addresses = [{ id: 1, addressType: testAddress }, { id: 2, addressType: 'test2' }];
  setupApplication({
    component: (
      <ConnectedComponent
        form="1"
        key="test"
        uiId="1"
        onSubmit={handleSubmitEdit}
        canDelete
        canEdit
        addresses={addresses}
      />
    )
  });


  beforeEach(() => {
    addresses = [{ id: 1, addressType: testAddress }, { id: 2, addressType: 'test2' }];
  });

  it('renders', () => { addressList.exists(); });

  it('displays only a single address', () => {
    addressList.has({ count: 1 });
  });

  describe('expanding the list', () => {
    beforeEach(async () => {
      await addressList.toggleMore();
    });

    it('displays two addresses', () => {
      addressList.has({ count: 2 });
    });
  });

  describe('adding a new address', () => {
    beforeEach(async () => {
      await addressList.addAddress();
    });

    it('displays the edit form', () => {
      AddressEdit().exists();
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

        it('displays validation error (no address type)', () => {
          TextField('Address Type').has({ error: true });
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

    it('displays the edit form', () => {
      AddressEdit().exists();
    });

    describe('cancel edit', () => {
      beforeEach(async () => {
        await AddressEdit().cancel();
      });

      it('removes the edit form', () => {
        AddressEdit().absent();
      });
    });

    describe('save edits', () => {
      beforeEach(async () => {
        await AddressEdit().save();
      });

      it('calls the submit handler', () => {
        converge(() => handleSubmitEditCalled);
      });
    });
  });
});

describe('Address Edit - React-final-form', () => {
  let added = false;
  let deleted = false;
  let addresses = [{ id: 1, city: 'Baltimore' }];
  setupApplication({
    component: (
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
    )
  });

  beforeEach(() => {
    addresses = [{ id: 1, city: 'Baltimore' }];
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
  let added = false;
  let deleted = false;
  let addresses = [{ id: 1, city: 'Baltimore' }];
  setupApplication({
    component: (
      <TestForm initialValues={{ addresses }}>
        <AddressEditList
          name="addresses"
          canDelete
          onAdd={() => { added = true; }}
          onDelete={() => { deleted = true; }}
        />
      </TestForm>
    )
  });

  beforeEach(async () => {
    addresses = [{ id: 1, city: 'Baltimore' }];
    added = false;
    deleted = false;
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


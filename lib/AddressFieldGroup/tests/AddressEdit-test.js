import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import AddressEdit from '../AddressEdit';
import { setupApplication, mount } from '../../../tests/helpers';
import connectStripes from '../../../tests/connectStripes';
import AddressEditInteractor from './interactor';

import translation from '../../../translations/stripes-smart-components/en';

const ConnectedComponent = connectStripes(AddressEdit);

describe('AddressEdit', () => {
  const addressEditInteractor = new AddressEditInteractor();
  setupApplication();
  const testAddress = 'test';

  beforeEach(() => {
    const handleCancelEdit = sinon.spy();
    const handleDeleteEdit = sinon.spy();
    const handleSubmitEdit = sinon.spy();

    mount(
      <ConnectedComponent
        form="test"
        key="test"
        uiId="test"
        handleCancel={handleCancelEdit}
        handleDelete={handleDeleteEdit}
        onSubmit={handleSubmitEdit}
        canDelete
        addresses={[{ addressType: testAddress }]}
        addressObject={{ id:'test' }}
        initialValues={{ id:'test' }}
      />
    );
  });

  describe('addressType field', () => {
    it('should have proper label', () => {
      expect(addressEditInteractor.addressType.has({ label: translation['addressEdit.label.addressType'] }));
    });

    describe('fill empty string', () => {
      beforeEach(async () => {
        await addressEditInteractor.addressType.fillIn('');
      });

      it('error should be presented', () => {
        addressEditInteractor.addressType.has({ error: 'Address type is required' });
      });
    });

    describe('fill empty addressType', () => {
      beforeEach(async () => {
        await addressEditInteractor.addressType.fillIn('addressType');
      });

      it('error not should be presented', () => {
        addressEditInteractor.addressType.has({ error: '' });
      });
    });

    describe('fill existing addressType', () => {
      beforeEach(async () => {
        await addressEditInteractor.addressType.fillIn(testAddress);
      });

      it('error should be presented', () => {
        addressEditInteractor.addressType.has({ error: 'Address type is required' });
      });
    });
  });

  describe('addressLine1 field', () => {
    it('should have proper label', () => {
      addressEditInteractor.addressLine1.has({ label: translation['addressEdit.label.addressLine1'] });
    });
  });

  describe('addressLine2 field', () => {
    it('should have proper label', () => {
      addressEditInteractor.addressLine2.has({ label: translation['addressEdit.label.addressLine2'] });
    });
  });

  describe('stateRegion field', () => {
    it('should have proper label', () => {
      addressEditInteractor.stateRegion.has({ label: translation['addressEdit.label.stateRegion'] });
    });
  });

  describe('zipCode field', () => {
    it('should have proper label', () => {
      addressEditInteractor.zipCode.has({ label: translation['addressEdit.label.zipCode'] });
    });
  });

  describe('city field', () => {
    it('should have proper label', () => {
      addressEditInteractor.city.has({ label: translation['addressEdit.label.city'] });
    });
  });

  describe('country field', () => {
    it('should have proper label', () => {
      addressEditInteractor.country.has({ label: translation['addressEdit.label.country'] });
    });
  });
});

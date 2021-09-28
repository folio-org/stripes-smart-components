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
      expect(addressEditInteractor.addressType.text).to.equal(translation['addressEdit.label.addressType']);
    });

    describe.skip('fill empty string', () => {
      beforeEach(async () => {
        await addressEditInteractor.addressType.fillAndBlur('');
      });

      it('error should be presented', () => {
        expect(addressEditInteractor.addressType.inputError).to.be.true;
      });
    });

    describe('fill empty addressType', () => {
      beforeEach(async () => {
        await addressEditInteractor.addressType.fillAndBlur('addressType');
      });

      it('error not should be presented', () => {
        expect(addressEditInteractor.addressType.inputError).to.be.false;
      });
    });

    describe.skip('fill existing addressType', () => {
      beforeEach(async () => {
        await addressEditInteractor.addressType.fillAndBlur(testAddress);
      });

      it('error should be presented', () => {
        expect(addressEditInteractor.addressType.inputError).to.be.true;
      });
    });
  });

  describe('addressLine1 field', () => {
    it('should have proper label', () => {
      expect(addressEditInteractor.addressLine1.text).to.equal(translation['addressEdit.label.addressLine1']);
    });
  });

  describe('addressLine2 field', () => {
    it('should have proper label', () => {
      expect(addressEditInteractor.addressLine2.text).to.equal(translation['addressEdit.label.addressLine2']);
    });
  });

  describe('stateRegion field', () => {
    it('should have proper label', () => {
      expect(addressEditInteractor.stateRegion.text).to.equal(translation['addressEdit.label.stateRegion']);
    });
  });

  describe('zipCode field', () => {
    it('should have proper label', () => {
      expect(addressEditInteractor.zipCode.text).to.equal(translation['addressEdit.label.zipCode']);
    });
  });

  describe('city field', () => {
    it('should have proper label', () => {
      expect(addressEditInteractor.city.text).to.equal(translation['addressEdit.label.city']);
    });
  });

  describe('country field', () => {
    it('should have proper label', () => {
      expect(addressEditInteractor.country.text).to.equal(translation['addressEdit.label.country']);
    });
  });
});

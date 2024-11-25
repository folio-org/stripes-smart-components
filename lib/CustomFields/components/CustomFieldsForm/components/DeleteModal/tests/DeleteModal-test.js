import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import DeleteModal from '../DeleteModal';
import DeleteModalInteractor from './interactor';

import {
  mount,
  setupApplication,
  axe,
} from '../../../../../../../tests/helpers';
import fetchUsageStatistics from '../../../tests/helpers/fetchUsageStatistics';

describe.only('DeleteModal', () => {
  setupApplication();

  const deleteModal = new DeleteModalInteractor();
  const fieldsToDelete = [
    {
      id: '0',
      index: 0,
      name: 'Field 1',
    },
    {
      id: '1',
      index: 1,
      name: 'Field 2',
    },
  ];
  const optionsToDelete = {};
  const handleCancel = sinon.spy();
  const handleConfirm = sinon.spy();

  const defaultProps = {
    fieldsToDelete,
    submitting: false,
    handleCancel,
    handleConfirm,
    fetchUsageStatistics,
    optionsToDelete,
  };

  beforeEach(async () => {
    handleCancel.resetHistory();
    handleConfirm.resetHistory();
    await mount(<DeleteModal {...defaultProps} />);
  });

  describe('when fields stats have loaded', () => {
    beforeEach(async () => {
      await deleteModal.whenLoaded();
    });

    describe('when checking for a11y issues', () => {
      let a11yResults = null;

      beforeEach(async () => {
        a11yResults = await axe.run();
      });

      it('should not have any a11y issues', () => {
        expect(a11yResults.violations).to.be.empty;
      });
    });

    it('should not show loading icon', () => {
      expect(deleteModal.loadingIconIsPresent).to.be.false;
    });

    it('should show correct number of warning messages', () => {
      expect(deleteModal.customFieldsWarningMessages().length).to.equal(2);
    });

    it('should enable confirm button', () => {
      expect(deleteModal.confirmDisabled).to.be.false;
    });

    it('should enable cancel button', () => {
      expect(deleteModal.cancelDisabled).to.be.false;
    });

    describe('when clicking on cancel button', () => {
      beforeEach(async () => {
        await deleteModal.cancelButton.click();
      });

      it('should call handleCancel callback', () => {
        expect(handleCancel.calledOnce).to.be.true;
      });
    });

    describe('when clicking on confirm button', () => {
      beforeEach(async () => {
        await deleteModal.confirmButton.click();
      });

      it('should call handleConfirm callback', () => {
        expect(handleConfirm.calledOnce).to.be.true;
      });
    });
  });
});

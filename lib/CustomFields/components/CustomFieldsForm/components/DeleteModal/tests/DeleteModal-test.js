import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import DeleteModal from '../DeleteModal';
import DeleteModalInteractor from './interactor';

import { wait, mount, setupApplication } from '../../../../../../../tests/helpers';

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
  const handleCancel = sinon.spy();
  const handleConfirm = sinon.spy();
  const fetchUsageStatistics = (id) => Promise.resolve({
    json: () => Promise.resolve({
      fieldId: id,
      count: parseInt(id),
    }),
  });

  const renderComponent = (props) => {
    return mount(
      <DeleteModal
        fieldsToDelete={fieldsToDelete}
        submitting={false}
        handleCancel={handleCancel}
        handleConfirm={handleConfirm}
        fetchUsageStatistics={fetchUsageStatistics}
        {...props}
      />
    );
  };

  beforeEach(async () => {
    await renderComponent();
    handleCancel.resetHistory();
    handleConfirm.resetHistory();
  });

  describe('when fields stats have not loaded yet', () => {
    beforeEach(async () => {
      const fetchUsageStatisticsWithWait = (id) => new Promise(async resolve => {
        const res = await fetchUsageStatistics(id);
        await wait(20000);
        resolve(res);
      });

      await renderComponent({
        fetchUsageStatistics: fetchUsageStatisticsWithWait,
      });
    });

    it('should show loading icon', () => {
      expect(deleteModal.loadingIconIsPresent).to.be.true;
    });

    it('should disable confirm button', () => {
      expect(deleteModal.confirmDisabled).to.be.true;
    });
  });

  describe('when fields stats have loaded', () => {
    beforeEach(() => {
      return deleteModal.whenLoaded();
    });

    it('should not show loading icon', () => {
      expect(deleteModal.loadingIconIsPresent).to.be.false;
    });

    it('should show correct number of warning messages', () => {
      expect(deleteModal.warningMessages().length).to.equal(2);
    });

    it('should enable confirm button', () => {
      expect(deleteModal.confirmDisabled).to.be.false;
    });

    it('should enable cancel button', () => {
      expect(deleteModal.cancelDisabled).to.be.false;
    });

    describe('when clicking on cancel button', () => {
      beforeEach(async () => {
        await deleteModal.cancel();
      });

      it('should call handleCancel callback', () => {
        expect(handleCancel.calledOnce).to.be.true;
      });
    });

    describe('when clicking on confirm button', () => {
      beforeEach(async () => {
        await deleteModal.confirm();
      });

      it('should call handleConfirm callback', () => {
        expect(handleConfirm.calledOnce).to.be.true;
      });
    });
  });
});

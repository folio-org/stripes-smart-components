import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  HTML,
  runAxeTest,
  Button,
  including,
} from '@folio/stripes-testing';

import DeleteModal from '../DeleteModal';

import {
  mount,
  setupApplication,
} from '../../../../../../../tests/helpers';
import fetchUsageStatistics from '../../../tests/helpers/fetchUsageStatistics';

const IconInteractor = HTML.extend('icon')
  .selector('[class*=icon---]')
  .filters({
    iconClass: (el) => {
      return el.querySelector('[data-test-icon-element]') ?
        el.querySelector('[data-test-icon-element]').getAttribute('class') :
        el.querySelector('svg').getAttribute('class') || '';
    },
  });

const ErrorListInteractor = HTML.extend('error list')
  .selector('ul')
  .filters({
    count: el => el.querySelectorAll('li').length
  });

describe('DeleteModal', () => {
  setupApplication();

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
    describe('when checking for a11y issues', () => {
      it('should not have any a11y issues', () => runAxeTest());

      it('should not show loading icon', () => IconInteractor({ iconClass: including('loading') }).absent());

      it('should show correct number of warning messages', () => ErrorListInteractor().has({ count: 2 }));

      it('should enable confirm button', () => Button({ text:including('Save'), disabled: false }).exists());

      it('should enable cancel button', () => Button({ text: including('Cancel'), disabled: false }).exists());
    });
    describe('when clicking on cancel button', () => {
      beforeEach(async () => {
        await Button({ text: including('Cancel') }).click();
      });

      it('should call handleCancel callback', () => {
        expect(handleCancel.calledOnce).to.be.true;
      });
    });

    describe('when clicking on confirm button', () => {
      beforeEach(async () => {
        await Button({ text:including('Save') }).click();
      });

      it('should call handleConfirm callback', () => {
        expect(handleConfirm.calledOnce).to.be.true;
      });
    });
  });
});

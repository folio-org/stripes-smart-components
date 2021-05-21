import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import NotePopupModal from '../NotePopupModal';
import NotePopupModalInteractor from './interactor';

import {
  setupApplication,
  axe,
} from '../../../../tests/helpers';

axe.configure({
  rules: [{
    id: 'document-title',
    enabled: false,
  }],
});

describe('NotePopupModal', () => {
  let a11yResults = null;

  const notePopupModal = new NotePopupModalInteractor();

  const setup = (props = {}) => {
    const defaultProps = {
      domainName: 'dummy',
      entityId: 'providerId',
      entityType: 'provider',
      popUpPropertyName: 'popUpOnCheckout',
    };

    setupApplication({
      scenarios: ['create-notes-with-note-types'],
      component: (
        <NotePopupModal
          {...defaultProps}
          {...props}
        />
      )
    });
  };

  describe('when note edit page is visited', () => {
    setup();

    beforeEach(async () => {
      await notePopupModal.whenLoaded();
    });

    describe('waiting for aXe to run', () => {
      beforeEach(async () => {
        a11yResults = await axe.run();
      });

      it('should not have any a11y issues', () => {
        expect(a11yResults.violations).to.be.empty;
      });
    });

    it('should display modal label', () => {
      expect(notePopupModal.modal.label).to.equal('Note for patron');
    });

    it('should display note content', () => {
      expect(notePopupModal.noteContent).to.equal('Note details');
    });

    describe('when clicking on close button', () => {
      beforeEach(async () => {
        await notePopupModal.closeButton.click();
      });

      it('should set note as dismissed', () => {
        const storageItem = JSON.parse(sessionStorage.getItem('popUpNoteInfo.providerNoteId'));

        expect(storageItem).to.eql({
          isDismissed: true,
        });
      });
    });
  });
});

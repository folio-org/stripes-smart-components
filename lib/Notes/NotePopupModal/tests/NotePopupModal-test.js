import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import { Keyboard } from '@folio/stripes-testing';

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
      sessionStorage.removeItem('@folio/ui-dummy:popUpNoteInfo.providerNoteId');
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

    it('should display note content 1', () => {
      expect(notePopupModal.noteContent).to.equal('Note details');
    });

    describe('close the modal 1', () => {
      beforeEach(async () => {
        await notePopupModal.closeButton.click();
      });

      it('should have modal 2', () => {
        expect(notePopupModal.modal.isPresent).to.be.true;
      });
    });

    describe('should display second modal', () => {
      beforeEach(async () => {
        await notePopupModal.closeButton.click();
      });

      it('should display modal 2 label', () => {
        expect(notePopupModal.modal.label).to.equal('Note for patron');
      });

      it('should display note content 2', () => {
        expect(notePopupModal.noteContent).to.equal('Note2 details');
      });

      describe('close the modal 2', () => {
        beforeEach(async () => {
          await notePopupModal.closeButton.click();
        });

        it('should not have a modal', () => {
          expect(notePopupModal.modal.isPresent).to.be.false;
        });
      });
    });

    describe('close modal 1 on escape key hit', () => {
      beforeEach(async () => {
        await notePopupModal.focus();
        await Keyboard.pressKey('Escape');
      });

      it('should have modal 2', () => {
        expect(notePopupModal.modal.isPresent).to.be.true;
      });
    });

    describe('should display second modal after close modal 1 with escape key', () => {
      beforeEach(async () => {
        await notePopupModal.focus();
        await Keyboard.pressKey('Escape');
      });

      it('should display modal 2 label', () => {
        expect(notePopupModal.modal.label).to.equal('Note for patron');
      });

      it('should display note content 2', () => {
        expect(notePopupModal.noteContent).to.equal('Note2 details');
      });
    });
  });
});

import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from 'mocha';
import {
  Button,
  Keyboard,
  Modal,
  including,
  runAxeTest,
} from '@folio/stripes-testing';

import NotePopupModal from '../NotePopupModal';

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
  const noteModal = Modal({ message: including('Note details') });
  const noteModal2 = Modal({ message: including('Note2 details') });
  const closeButton = noteModal.find(Button('Close'));
  const closeButton2 = noteModal2.find(Button('Close'));

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
      await sessionStorage.removeItem('@folio/ui-dummy:popUpNoteInfo.providerNoteId');
    });

    it('should not have axe(a11y) issues', () => runAxeTest());

    it('should display modal label', () => noteModal.has({ header: 'Note for patron' }));

    describe('close the modal 1', () => {
      beforeEach(async () => {
        await closeButton.click();
      });

      it('should have modal 2', () => Promise.all([
        noteModal2.exists(),
        noteModal.absent()
      ]));
    });

    describe('should display second modal', () => {
      beforeEach(async () => {
        await closeButton.click();
      });

      it('should display modal 2 label', () => noteModal2.has({ header: 'Note for patron' }));

      describe('close the modal 2', () => {
        beforeEach(async () => {
          await closeButton2.click();
        });

        it('should not have a modal', () => Modal().absent());
      });
    });

    describe('close modal 1 on escape key hit', () => {
      beforeEach(async () => {
        await Keyboard.escape();
      });

      it('should have modal 2', () => Promise.all([
        noteModal2.exists(),
        noteModal.absent()
      ]));
    });

    describe('should display second modal after close modal 1 with escape key', () => {
      beforeEach(async () => {
        await Keyboard.escape();
      });

      it('should display modal 2 label', () => noteModal2.has({ header: 'Note for patron' }));

      describe('close the modal 2', () => {
        beforeEach(async () => {
          await Keyboard.escape();
        });

        it('should not have a modal', () => Modal().absent());
      });
    });
  });
});

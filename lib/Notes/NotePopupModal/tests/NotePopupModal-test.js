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

  const defaultProps = {
    domainName: 'dummy',
    entityId: 'providerId',
    entityType: 'provider',
    popUpPropertyName: 'popUpOnCheckout',
  };

  const setup = (scenarios = ['create-notes-with-note-types']) => {
    setupApplication({
      scenarios,
      component: (
        <NotePopupModal
          {...defaultProps}
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

    it('should display note content', () => {
      expect(notePopupModal.noteContent).to.equal('Note details');
    });

    describe('when there are no assigned notes', () => {
      beforeEach(function () {
        this.server.get('/note-links/domain/dummy/type/:type/id/:id', {
          totalRecords: 0,
        });

        setup();
      });

      it('should not display modal', () => {
        expect(notePopupModal.modal.isPresent).to.be.false;
      });
    });
  });
});

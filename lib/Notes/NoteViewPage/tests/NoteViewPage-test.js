import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { including, converge } from '@folio/stripes-testing';

import NoteViewPage from '../NoteViewPage';
import NoteViewPageInteractor from './interactor';
import {
  setupApplication,
} from '../../../../tests/helpers';

describe('NoteViewPage', () => {
  const noteViewPage = new NoteViewPageInteractor();

  const referredEntityData = {
    name: 'Test Name',
    type: 'Type',
    id: '1',
  };
  const entityTypeTranslationKeys = { [referredEntityData.type]: 'Test' };
  const entityTypePluralizedTranslationKeys = { request: 'Request' };
  const noteId = 'providerNoteId';
  const navigateBackSpy = sinon.spy();
  const onEditSpy = sinon.spy();

  const setup = (props) => {
    const defaultProps = {
      entityTypeTranslationKeys,
      entityTypePluralizedTranslationKeys,
      navigateBack: navigateBackSpy,
      onEdit: onEditSpy,
      referredEntityData,
      noteId,
    };

    setupApplication({
      scenarios: ['note-view-page'],
      component: <NoteViewPage
        {...defaultProps}
        {...props}
      />
    });
  };

  describe('rendering NoteView component', () => {
    setup();

    beforeEach(async () => {
      await noteViewPage.whenLoaded();

      navigateBackSpy.resetHistory();
      onEditSpy.resetHistory();
    });

    it('should render NoteView', () => {
      expect(noteViewPage.noteView.isPresent).to.be.true;
    });

    describe('when clicking on close button', () => {
      beforeEach(async () => {
        await noteViewPage.noteView.clickCloseNoteView();
      });

      it('should call navigateBack', () => {
        converge(() => navigateBackSpy.calledOnce);
      });
    });

    describe('when deleting a note', () => {
      beforeEach(async () => {
        await noteViewPage.noteView.clickDeleteNote();
      });

      it('should show delete confirmation modal', () => {
        expect(noteViewPage.confirmDeleteModal.isPresent).to.be.true;
      });

      describe('when confirming a delete', () => {
        beforeEach(async () => {
          await noteViewPage.confirmDeleteModal.confirmButton.click();
        });

        it('should call navigateBack', () => {
          converge(() => navigateBackSpy.calledOnce);
        });
      });
    });

    describe('when unassigning a note', () => {
      beforeEach(async () => {
        await noteViewPage.noteView.clickUnassignNote();
      });

      it('should show unassign confirmation modal', () => {
        expect(noteViewPage.confirmUnassignModal.isPresent).to.be.true;
      });

      describe('when confirming unassignment', () => {
        beforeEach(async () => {
          await noteViewPage.confirmUnassignModal.confirmButton.click();
        });

        it('should call navigateBack', () => {
          converge(() => navigateBackSpy.calledOnce);
        });
      });
    });
  });

  describe('when a note was never updated', () => {
    setup({
      noteId: 'neverUpdatedNote',
    });

    beforeEach(async () => {
      await noteViewPage.whenLoaded();
    });

    it('should show creator username in "Last Updated"',
      // see note-view-page scenario for note data
      () => noteViewPage.noteView.metaSection.has({ updatedByText: including('diku_admin') }));
  });

  describe('when a note was updated', () => {
    setup({
      noteId: 'updatedNote',
    });

    beforeEach(async () => {
      await noteViewPage.whenLoaded();
    });

    it('should show updated by username in "Last Updated"',
      // see note-view-page scenario for note data
      () => noteViewPage.noteView.metaSection.has({ updatedByText: including('non-admin') }));
  });
});

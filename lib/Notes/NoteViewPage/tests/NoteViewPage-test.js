import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import NoteViewPage from '../NoteViewPage';
import NoteViewPageInteractor from './interactor';
import {
  mount,
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

  setupApplication({
    scenarios: ['note-view-page'],
  });

  const renderComponent = (props) => {
    const defaultProps = {
      entityTypeTranslationKeys,
      entityTypePluralizedTranslationKeys,
      navigateBack: navigateBackSpy,
      onEdit: onEditSpy,
      referredEntityData,
      noteId,
    };

    return mount(
      <NoteViewPage
        {...defaultProps}
        {...props}
      />
    );
  };

  describe('rendering NoteView component', () => {
    beforeEach(async () => {
      renderComponent();
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
        expect(navigateBackSpy.calledOnce).to.be.true;
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
          expect(navigateBackSpy.calledOnce).to.be.true;
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
          expect(navigateBackSpy.calledOnce).to.be.true;
        });
      });
    });
  });

  describe('when a note was never updated', () => {
    beforeEach(async () => {
      renderComponent({
        noteId: 'neverUpdatedNote',
      });

      await noteViewPage.whenLoaded();
    });

    it('should show creator username in "Last Updated"', () => {
      // see note-view-page scenario for note data
      expect(noteViewPage.noteView.metaSection.updatedByText).to.include('diku_admin');
    });
  });

  describe('when a note was updated', () => {
    beforeEach(async () => {
      renderComponent({
        noteId: 'updatedNote',
      });

      await noteViewPage.whenLoaded();
    });

    it('should show updated by username in "Last Updated"', () => {
      // see note-view-page scenario for note data
      expect(noteViewPage.noteView.metaSection.updatedByText).to.include('non-admin');
    });
  });
});

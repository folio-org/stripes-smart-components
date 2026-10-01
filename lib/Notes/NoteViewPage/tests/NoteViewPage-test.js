/* eslint-disable no-unused-expressions -- chai property assertions, e.g. expect(x).to.be.true */
import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { including, converge, ConfirmationModal, HTML, MetaSection } from '@folio/stripes-testing';

import NoteViewPage from '../NoteViewPage';
import {
  setupApplication,
} from '../../../../tests/helpers';

describe('NoteViewPage', () => {
  const NoteView = HTML.extend('note view').selector('[data-test-note-view]');
  const clickInNoteView = (selector) => NoteView().perform(el => el.querySelector(selector).click());
  const confirmDeleteModal = ConfirmationModal({ id: 'confirm-delete-note' });
  const confirmUnassignModal = ConfirmationModal({ id: 'confirm-unassign-note' });

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
      await NoteView().exists();

      navigateBackSpy.resetHistory();
      onEditSpy.resetHistory();
    });

    it('should render NoteView', async () => {
      await NoteView().exists();
    });

    describe('when clicking on close button', () => {
      beforeEach(async () => {
        await clickInNoteView('[data-test-leave-note-view]');
      });

      it('should call navigateBack', () => {
        converge(() => navigateBackSpy.calledOnce);
      });
    });

    describe('when deleting a note', () => {
      beforeEach(async () => {
        await clickInNoteView('[data-test-note-delete]');
      });

      it('should show delete confirmation modal', async () => {
        await confirmDeleteModal.exists();
      });

      describe('when confirming a delete', () => {
        beforeEach(async () => {
          await confirmDeleteModal.confirm('Delete');
        });

        it('should call navigateBack', () => {
          converge(() => navigateBackSpy.calledOnce);
        });
      });
    });

    describe('when unassigning a note', () => {
      beforeEach(async () => {
        await clickInNoteView('[data-test-note-unassign]');
      });

      it('should show unassign confirmation modal', async () => {
        await confirmUnassignModal.exists();
      });

      describe('when confirming unassignment', () => {
        beforeEach(async () => {
          await confirmUnassignModal.confirm('Unassign');
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
      await NoteView().exists();
    });

    it('should show creator username in "Last Updated"',
      // see note-view-page scenario for note data
      () => MetaSection().has({ updatedByText: including('diku_admin') }));
  });

  describe('when a note was updated', () => {
    setup({
      noteId: 'updatedNote',
    });

    beforeEach(async () => {
      await NoteView().exists();
    });

    it('should show updated by username in "Last Updated"',
      // see note-view-page scenario for note data
      () => MetaSection().has({ updatedByText: including('non-admin') }));
  });
});

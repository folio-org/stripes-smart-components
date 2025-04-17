import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import faker from 'faker';
import {
  Button,
  Checkbox,
  KeyValue,
  TextField,
  Accordion,
  Select,
  runAxeTest,
  converge,
  including
} from '@folio/stripes-testing';

import NoteEditPage from '../NoteEditPage';

import {
  nonQuillAxeConfig,
  NoteCreateFormInteractor,
  ContentEditableField as Editor
} from '../../tests/interactors';

import {
  setupApplication,
} from '../../../../tests/helpers';


describe('NoteEditPage', () => {
  const referredEntityData = {
    name: 'Test Name',
    type: 'Type',
    id: '1',
  };
  const entityTypeTranslationKeys = { [referredEntityData.type]: 'Test' };
  const entityTypePluralizedTranslationKeys = {
    request: 'Request',
    provider: 'Provider',
  };
  const navigateBackSpy = sinon.spy();

  const noteEditPage = NoteCreateFormInteractor();
  const assignAccordion = Accordion(including('Assigned'));
  const saveButton = Button(including('Save'));
  const cancelButton = Button(including('Cancel'));

  const lengthyValue = faker.lorem.words(100);
  const setup = (props = {}) => {
    const defaultProps = {
      domain: 'users',
      entityTypeTranslationKeys,
      entityTypePluralizedTranslationKeys,
      navigateBack: navigateBackSpy,
      referredEntityData,
      noteId: 'providerNoteId',
    };

    setupApplication({
      scenarios: ['create-notes-with-note-types'],
      component: (
        <NoteEditPage
          {...defaultProps}
          {...props}
        />
      )
    });
  };

  describe('when note edit page is visited', () => {
    setup();

    beforeEach(async () => {
      navigateBackSpy.resetHistory();
      await converge(() => noteEditPage.exists());
    });

    it('should not have any a11y issues', () => runAxeTest(nonQuillAxeConfig));

    it('should display general information accordion', () => Accordion(including('General')).exists());

    it('should display correct note title', () => TextField(including('title')).has({ value: 'A Note type' }));

    it('should display correct note type', () => Select(including('type')).has({ value: 'general-type-id' }));

    it('should display correct note details', () => Editor().has({ value: 'Note details' }));

    it('should display assignments information accordion', () => assignAccordion.exists());

    it('should disable save button', () => saveButton.is({ disabled: true }));

    describe('and note title length is exceeded', () => {
      beforeEach(async () => {
        await noteEditPage.fillNoteTitle(lengthyValue);
      });

      it('should not have any a11y issues', () => runAxeTest(nonQuillAxeConfig));

      it('should display title length error', () => TextField(including('title')).has({ error: 'Note title character limit has been exceeded' }));

      describe('and save button is clicked', () => {
        beforeEach(async () => {
          await saveButton.click();
        });

        it('should not redirect to previous location', () => {
          expect(navigateBackSpy.called).to.be.false;
        });
      });
    });

    describe('and correct note data was entered', () => {
      beforeEach(async () => {
        await noteEditPage.setNoteType('General');
        await noteEditPage.fillNoteTitle('some note title');
        await noteEditPage.fillNoteData('some note text');
      });

      it('should not have any a11y issues', () => runAxeTest(nonQuillAxeConfig));

      it('should enable save button', () => saveButton.has({ disabled: false }));

      describe('and close button was clicked', () => {
        beforeEach(async () => {
          await noteEditPage.clickClose();
        });

        it('should not have any a11y issues', () => runAxeTest(nonQuillAxeConfig));
      });

      describe('and save button was clicked', () => {
        beforeEach(async () => {
          await saveButton.click();
        });

        it('should redirect to previous page', () => {
          expect(navigateBackSpy.called).to.be.false;
        });
      });
    });

    describe('Note entity type contents', () => {
      beforeEach(async () => {
        await assignAccordion.clickHeader();
      });

      it('should display correct referred entity type', () => KeyValue('Test').has({ value: 'Test Name' }));
    });

    describe('and cancel editing button is clicked', () => {
      beforeEach(async () => {
        await cancelButton.click();
      });

      it('should redirect to previous page', () => {
        expect(navigateBackSpy.called).to.be.true;
      });
    });
  });

  describe('when note edit page is visited', () => {
    setup({
      showDisplayAsPopupOptions: true,
    });

    beforeEach(async () => {
      navigateBackSpy.resetHistory();
    });

    it('should not have any a11y issues', () => runAxeTest(nonQuillAxeConfig));

    it('should show popup on checkout and popup on users fields', () => Promise.all([
      Checkbox('Check out app').exists(),
      Checkbox('Users app').exists()
    ]));
  });
});

import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from 'mocha';
import sinon from 'sinon';
import faker from 'faker';
import {
  Button,
  Checkbox,
  Accordion,
  TextField,
  runAxeTest,
  converge,
  including
} from '@folio/stripes-testing';

import NoteCreatePage from '../NoteCreatePage';
import {
  NoteCreateFormInteractor,
  nonQuillAxeConfig
} from '../../tests/interactors';

import {
  setupApplication,
} from '../../../../tests/helpers';

describe('NoteCreatePage', () => {
  const referredEntityData = {
    name: 'Test Name',
    type: 'Type',
    id: '1',
  };
  const entityTypeTranslationKeys = { [referredEntityData.type]: 'Test' };
  const entityTypePluralizedTranslationKeys = { request: 'Request' };
  const navigateBackSpy = sinon.spy();

  const noteCreatePage = NoteCreateFormInteractor();
  const saveButton = Button(including('Save'));

  const assertNavigateBackCalled = () => { if (!navigateBackSpy.called) throw new Error('expected navigateBack handler to be called!'); };
  const assertNavigateBackNotCalled = () => { if (navigateBackSpy.called) throw new Error('expected navigateBack handler to not be called!'); };

  const lengthyValue = faker.lorem.words(100);

  const setup = (props = {}) => {
    const defaultProps = {
      domain: 'users',
      entityTypeTranslationKeys,
      entityTypePluralizedTranslationKeys,
      navigateBack: navigateBackSpy,
      referredEntityData,
    };

    setupApplication({
      scenarios: ['create-notes-with-note-types'],
      component: (
        <NoteCreatePage
          {...defaultProps}
          {...props}
        />
      )
    });
  };

  describe('when note create page is visited', () => {
    setup();

    beforeEach(async () => {
      navigateBackSpy.resetHistory();
      await converge(() => noteCreatePage.exists());
    });

    it('should not have any a11y issues', () => runAxeTest(nonQuillAxeConfig));

    it('displays assignment accordion as closed', () => Accordion('Assigned').is({ open: false }));

    it('should disable save button', () => saveButton.is({ disabled: true }));

    describe('and the form is touched', () => {
      describe('and note title length is exceeded', () => {
        beforeEach(async () => {
          await noteCreatePage.fillNoteTitle(lengthyValue);
        });

        it('should not have any a11y issues', () => runAxeTest(nonQuillAxeConfig));

        it('should display title length error', () => TextField(including('title')).has({ error: 'Note title character limit has been exceeded' }));

        describe('and save button is clicked', () => {
          beforeEach(async () => {
            await saveButton.click();
          });

          it('should not redirect to previous location', () => () => converge(assertNavigateBackNotCalled));
        });
      });

      describe('and correct note data was entered', () => {
        beforeEach(async () => {
          await noteCreatePage.setNoteType('General');
          await noteCreatePage.fillNoteTitle('some note title');
          await noteCreatePage.fillNoteData('some note text');
        });

        it('should not have any a11y issues', () => runAxeTest(nonQuillAxeConfig));

        it('should enable save button', () => saveButton.is({ disabled: false }));

        describe('and close button was clicked', () => {
          beforeEach(async () => {
            await noteCreatePage.clickClose();
          });
        });

        describe('and save button was clicked', () => {
          beforeEach(async () => {
            await saveButton.click();
          });

          it('should not have any a11y issues', () => runAxeTest(nonQuillAxeConfig));

          it('should redirect to previous page', () => converge(assertNavigateBackCalled));
        });
      });
    });

    describe('and close button was clicked', () => {
      beforeEach(async () => {
        await noteCreatePage.clickClose();
      });

      it('should redirect to previous location', () => converge(assertNavigateBackCalled));
    });
  });

  describe('when note create page is visited', () => {
    setup({
      showDisplayAsPopupOptions: true,
    });

    beforeEach(async () => {
      navigateBackSpy.resetHistory();
      converge(() => noteCreatePage.exists());
    });

    it('should not have any a11y issues', () => runAxeTest(nonQuillAxeConfig));

    it('should show popup on checkout and popup on users fields', () => Promise.all([
      Checkbox('Check out app').exists(),
      Checkbox('Users app').exists()
    ]));
  });
});

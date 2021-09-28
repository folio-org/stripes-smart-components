import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import faker from 'faker';

import NoteEditPage from '../NoteEditPage';
import NoteEditPageInteractor from './interactor';

import {
  setupApplication,
  axe,
} from '../../../../tests/helpers';

axe.configure({
  rules: [{
    id: 'color-contrast',
    enabled: false,
  }],
});

describe('NoteEditPage', () => {
  let a11yResults = null;

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

  const noteEditPage = new NoteEditPageInteractor();

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

      await noteEditPage.whenLoaded();
    });

    describe('waiting for aXe to run', () => {
      beforeEach(async () => {
        a11yResults = await axe.run({
          exclude: ['.quill']
        });
      });

      it('should not have any a11y issues', () => {
        expect(a11yResults.violations).to.be.empty;
      });
    });

    it('should display general information accordion', () => {
      expect(noteEditPage.noteForm.formFieldsAccordionIsDisplayed).to.be.true;
    });

    it('should display correct note title', () => {
      expect(noteEditPage.noteForm.noteTitleField.value).to.equal('A Note type');
    });

    it('should display correct note type', () => {
      expect(noteEditPage.noteForm.noteTypesSelect.value).to.equal('general-type-id');
    });

    it('should display correct note details', () => {
      expect(noteEditPage.noteForm.noteDetailsField.value).to.equal('Note details');
    });

    it('should display assignments information accordion', () => {
      expect(noteEditPage.noteForm.assignmentInformationAccordionIsDisplayed).to.be.true;
    });

    it('should display correct referred entity type', () => {
      expect(noteEditPage.noteForm.referredEntityType.toLowerCase()).to.equal('test');
    });

    it('should display correct referred entity name', () => {
      expect(noteEditPage.noteForm.referredEntityName).to.equal('Test Name');
    });

    it('should disable save button', () => {
      expect(noteEditPage.noteForm.saveButton.isDisabled).to.be.true;
    });

    describe('and cancel editing button is clicked', () => {
      beforeEach(async () => {
        await noteEditPage.noteForm.clickCancelButton();
      });

      it('should redirect to previous page', () => {
        expect(navigateBackSpy.called).to.be.true;
      });
    });

    describe('and the form is touched', () => {
      describe('and note title length is exceeded', () => {
        beforeEach(async () => {
          await noteEditPage.noteForm.noteTitleField.enterText(faker.lorem.words(100));
        });

        describe('waiting for aXe to run', () => {
          beforeEach(async () => {
            a11yResults = await axe.run({
              exclude: ['.quill']
            });
          });

          it('should not have any a11y issues', () => {
            expect(a11yResults.violations).to.be.empty;
          });
        });

        it.skip('should display title length error', () => {
          expect(noteEditPage.noteForm.hasTitleLengthError).to.be.true;
        });

        describe('and save button is clicked', () => {
          beforeEach(async () => {
            await noteEditPage.noteForm.saveButton.click();
          });

          it('should not redirect to previous location', () => {
            expect(navigateBackSpy.called).to.be.false;
          });
        });
      });

      describe('and correct note data was entered', () => {
        beforeEach(async () => {
          await noteEditPage.noteForm.enterNoteData('General', 'some note title');
        });

        describe('waiting for aXe to run', () => {
          beforeEach(async () => {
            a11yResults = await axe.run({
              exclude: ['.quill']
            });
          });

          it('should not have any a11y issues', () => {
            expect(a11yResults.violations).to.be.empty;
          });
        });

        it('should enable save button', () => {
          expect(noteEditPage.noteForm.saveButton.isDisabled).to.be.false;
        });

        describe('and close button was clicked', () => {
          beforeEach(async () => {
            await noteEditPage.noteForm.closeButton.click();
          });

          describe('waiting for aXe to run', () => {
            beforeEach(async () => {
              a11yResults = await axe.run({
                exclude: ['.quill']
              });
            });

            it('should not have any a11y issues', () => {
              expect(a11yResults.violations).to.be.empty;
            });
          });
        });

        describe('and save button was clicked', () => {
          beforeEach(async () => {
            await noteEditPage.noteForm.saveButton.click();
          });

          it('should redirect to previous page', () => {
            expect(navigateBackSpy.called).to.be.false;
          });
        });
      });
    });
  });

  describe('when note edit page is visited', () => {
    setup({
      showDisplayAsPopupOptions: true,
    });

    beforeEach(async () => {
      navigateBackSpy.resetHistory();

      await noteEditPage.whenLoaded();
    });

    describe('waiting for aXe to run', () => {
      beforeEach(async () => {
        a11yResults = await axe.run({
          exclude: ['.quill']
        });
      });

      it('should not have any a11y issues', () => {
        expect(a11yResults.violations).to.be.empty;
      });
    });

    it('should show popup on checkout and popup on users fields', () => {
      expect(noteEditPage.noteForm.popupOnCheckoutField.isPresent).to.be.true;
      expect(noteEditPage.noteForm.popupOnUsersField.isPresent).to.be.true;
    });
  });
});

import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import faker from 'faker';

import NoteCreatePage from '../NoteCreatePage';
import NoteCreatePageInteractor from './interactor';

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

describe('NoteCreatePage', () => {
  let a11yResults = null;

  const referredEntityData = {
    name: 'Test Name',
    type: 'Type',
    id: '1',
  };
  const entityTypeTranslationKeys = { [referredEntityData.type]: 'Test' };
  const entityTypePluralizedTranslationKeys = { request: 'Request' };
  const navigateBackSpy = sinon.spy();

  const noteCreatePage = new NoteCreatePageInteractor();

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

      await noteCreatePage.whenLoaded();
    });

    describe('waiting for axe to run', () => {
      beforeEach(async () => {
        a11yResults = await axe.run();
      });

      it('should not have any a11y issues', () => {
        expect(a11yResults.violations).to.be.empty;
      });
    });

    it.skip('displays assignment accordion as closed', () => {
      expect(noteCreatePage.noteForm.assignmentAccordion.isOpen).to.equal(false);
    });

    it('should disable save button', () => {
      expect(noteCreatePage.noteForm.saveButton.isDisabled).to.be.true;
    });

    describe('and close button was clicked', () => {
      beforeEach(async () => {
        await noteCreatePage.noteForm.closeButton.click();
      });

      it('should redirect to previous location', () => {
        expect(navigateBackSpy.called).to.be.true;
      });
    });

    describe('and the form is touched', () => {
      describe('and note title length is exceeded', () => {
        beforeEach(async () => {
          await noteCreatePage.noteForm.noteTitleField.enterText(faker.lorem.words(100));
          await noteCreatePage.noteForm.noteTitleField.focusout();
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

        it('should display title length error', () => {
          expect(noteCreatePage.noteForm.hasTitleLengthError).to.be.true;
        });

        describe('and save button is clicked', () => {
          beforeEach(async () => {
            await noteCreatePage.noteForm.saveButton.click();
          });

          it('should not redirect to previous location', () => {
            expect(navigateBackSpy.called).to.be.false;
          });
        });
      });

      describe('and correct note data was entered', () => {
        beforeEach(async () => {
          await noteCreatePage.noteForm.enterNoteData('General', 'some note title');
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
          expect(noteCreatePage.noteForm.saveButton.isDisabled).to.be.false;
        });

        describe('and close button was clicked', () => {
          beforeEach(async () => {
            await noteCreatePage.noteForm.closeButton.click();
          });
        });

        describe('and save button was clicked', () => {
          beforeEach(async () => {
            await noteCreatePage.noteForm.saveButton.click();
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

          it('should redirect to previous page', () => {
            expect(navigateBackSpy.called).to.be.true;
          });
        });
      });
    });
  });

  describe('when note create page is visited', () => {
    setup({
      showDisplayAsPopupOptions: true,
    });

    beforeEach(async () => {
      navigateBackSpy.resetHistory();

      await noteCreatePage.whenLoaded();
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
      expect(noteCreatePage.noteForm.popupOnCheckoutField.isPresent).to.be.true;
      expect(noteCreatePage.noteForm.popupOnUsersField.isPresent).to.be.true;
    });
  });
});

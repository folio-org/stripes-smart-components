import { expect } from 'chai';

import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';

import ControlledVocabInteractor from './interactor';
import mountComponent from './mountComponent';

import { setupApplication } from '../../../tests/helpers';

describe('ControlledVocab', () => {
  const cv = new ControlledVocabInteractor();

  describe('User can edit EditableListForm', () => {
    setupApplication();

    // eslint-disable-next-line no-undef
    beforeEach(() => mountComponent(true, server));

    describe('clicking New button', () => {
      beforeEach(async () => {
        await cv.newButton().click();
      });

      it('should disable New button', () => {
        expect(cv.disabledNewButton).to.be.true;
      });

      it('should disable Edit button', () => {
        expect(cv.disabledEditButton).to.be.true;
      });

      it('should disable Delete button', () => {
        expect(cv.disabledDeleteButton).to.be.true;
      });

      it('should display input field', () => {
        expect(cv.inputField).to.exist;
      });

      it('should disable Save button', () => {
        expect(cv.disabledSaveButton).to.be.true;
      });

      it('should display Cancel button', () => {
        expect(cv.cancelButton).to.exist;
      });

      describe('clicking Cancel button', () => {
        beforeEach(async () => {
          await cv.cancelButton().click();
        });

        it('should enable New button', () => {
          expect(cv.disabledNewButton).to.be.false;
        });

        it('should enable Edit button', () => {
          expect(cv.disabledEditButton).to.be.false;
        });

        it('should enable Delete button', () => {
          expect(cv.disabledDeleteButton).to.be.false;
        });
      });
    });

    describe('clicking New button', () => {
      beforeEach(async () => {
        await cv.newButton().click();
      });

      describe.skip('when blurring the input field', () => {
        beforeEach(async () => {
          await cv.blurInputField();
        });

        it('should display the error message', () => {
          expect(cv.emptyFieldError).to.equal('Please fill this in to continue');
        });
      });

      describe('when focusing on the input field', () => {
        beforeEach(async () => {
          await cv.fillInputField('test');
        });

        it('should not display the error message', () => {
          expect(cv.emptyFieldError).to.equal('');
        });

        it('should enable Save button', () => {
          expect(cv.disabledSaveButton).to.be.false;
        });
      });
    });

    describe('clicking Edit icon', () => {
      beforeEach(async () => {
        await cv.editButton.click();
      });

      it('should disable New button', () => {
        expect(cv.disabledNewButton).to.be.true;
      });

      it('should disable Edit button', () => {
        expect(cv.disabledEditButton).to.be.true;
      });

      it('should disable Delete button', () => {
        expect(cv.disabledDeleteButton).to.be.true;
      });

      it('should display input field', () => {
        expect(cv.inputField).to.exist;
      });

      it('should disable Save button', () => {
        expect(cv.disabledSaveButton).to.be.true;
      });

      it('should display Cancel button', () => {
        expect(cv.cancelButton).to.exist;
      });

      it('should not display Edit icon', () => {
        expect(cv.editButton.isPresent).to.be.false;
      });

      describe('clicking Cancel button', () => {
        beforeEach(async () => {
          await cv.cancelButton().click();
        });

        it('should enable New button', () => {
          expect(cv.disabledNewButton).to.be.false;
        });

        it('should display Edit icon', () => {
          expect(cv.editButton.isPresent).to.be.true;
        });

        it('should enable Edit button', () => {
          expect(cv.disabledEditButton).to.be.false;
        });

        it('should enable Delete button', () => {
          expect(cv.disabledDeleteButton).to.be.false;
        });
      });
    });
  });

  describe('User can edit EditableListForm', () => {
    setupApplication();

    // eslint-disable-next-line no-undef
    beforeEach(() => mountComponent(false, server));

    it('should render New button', () => {
      expect(cv.hasNewButton).to.be.false;
    });

    it('should render edit button', () => {
      expect(cv.hasEditButton).to.be.false;
    });

    it('should render delete button', () => {
      expect(cv.hasDeleteButton).to.be.false;
    });

    it('should render actions column', () => {
      expect(cv.hasActionsColumn).to.be.false;
    });

    it('should render input field column', () => {
      expect(cv.hasInputField).to.be.false;
    });

    it('should render save button', () => {
      expect(cv.hasSaveButton).to.be.false;
    });

    it('should render cancel button', () => {
      expect(cv.hasCancelButton).to.be.false;
    });
  });
});

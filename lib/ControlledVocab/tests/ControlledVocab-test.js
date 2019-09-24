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

  setupApplication();

  beforeEach(mountComponent);

  describe('clicking New button', () => {
    beforeEach(async () => {
      await cv.newButton().click();
    });

    it('should disable New button', () => {
      expect(cv.disabledNewButton).to.be.true;
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
    });
  });

  describe('clicking New button', () => {
    beforeEach(async () => {
      await cv.newButton().click();
    });

    describe('when blurring the input field', () => {
      beforeEach(async () => {
        await cv.blurInputField();
      });

      it('should display the error message', () => {
        expect(cv.emptyFieldError).to.equal('Please fill this in to continue');
      });
    });

    describe('when focusing on the input field', () => {
      beforeEach(async () => {
        await cv.fillInputField('asdf');
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
    });
  });
});

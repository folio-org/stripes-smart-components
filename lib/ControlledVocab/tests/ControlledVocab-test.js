import { expect } from 'chai';

import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';

import React from 'react';
import ControlledVocabInteractor from './interactor';
import mountComponent from './mountComponent';

import {
  setupApplication,
  mount,
} from '../../../tests/helpers';

import connectStripes from '../../../tests/connectStripes';
import ControlledVocab from '../ControlledVocab';

describe('ControlledVocab', () => {
  const cv = new ControlledVocabInteractor();

  describe('User can edit EditableListForm', () => {
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

  describe('User can edit EditableListForm', () => {
    const ConnectedComponent = connectStripes(ControlledVocab);
    setupApplication();

    beforeEach(() => {
      mount(
        <ConnectedComponent
          baseUrl="location-units/institutions"
          records="locinsts"
          label="Institutions"
          labelSingular="Institution"
          objectLabel="Location"
          visibleFields={['name', 'code', 'source']}
          columnMapping={{
            name: 'name',
            code: 'code',
            source: 'source',
          }}
          readOnlyFields={['source']}
          itemTemplate={{ source: 'local' }}
          hiddenFields={['description', 'numberOfObjects']}
          nameKey="name"
          // columnWidths={{ 'name': 300, 'code': 50 }}
          id="institutions"
          sortby="name"
          editable={false}
        />
      );
    });

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
  });
});

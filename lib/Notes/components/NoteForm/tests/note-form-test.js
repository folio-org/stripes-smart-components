import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import NoteForm from '../NoteForm';
import NoteFormInteractor from './interactor';
import {
  mount,
  setupApplication,
} from '../../../../../tests/helpers';
import translation from '../../../../../translations/stripes-smart-components/en';

const referredEntityData = {
  name: 'Test Name',
  type: 'Type',
  id: '1',
};
const entityTypeTranslationKeys = { [referredEntityData.type]: 'Test' };
const entityTypePluralizedTranslationKeys = { request: 'Request' };
const noteData = {
  content: undefined,
  links: [{
    id: '8460928a-0cc9-482f-b68a-1f0db7624439',
    type: 'request',
  }],
  title: 'Local information',
  type: 'General note',
};
const noteTypes = [{
  label: 'General note',
  value: '7d33b190-586a-41fa-b649-924c2d69c14c',
}];

const props = {
  createFormTitle: translation['notes.newNote'],
  entityTypePluralizedTranslationKeys,
  entityTypeTranslationKeys,
  navigateBack: () => {},
  noteData,
  noteTypes,
  onSubmit: () => {},
  paneHeaderAppIcon: 'requests',
  referredEntityData,
  submitIsPending: false,
  submitSucceeded: false,
};

describe('NoteForm', () => {
  const noteForm = new NoteFormInteractor();

  describe('rendering NoteForm component', () => {
    setupApplication();

    beforeEach(async () => {
      await mount(<NoteForm {...props} />);
    });

    it('should display NoteForm component', () => {
      expect(noteForm.isPresent).to.be.true;
    });

    it.skip('assigned accordion should be closed', () => {
      expect(noteForm.assignedAccordion.isOpen).to.be.false;
    });

    it('should display default Referred Record element', () => {
      expect(noteForm.defaultReferredRecord.isPresent).to.be.true;
    });
  });

  describe('rendering NoteForm component with inserted Referred Record element', () => {
    setupApplication();

    beforeEach(async () => {
      await mount(
        <NoteForm
          {...props}
          renderReferredRecord={() => <div data-test-inserted-referred-record>Test</div>}
        />
      );
    });

    it('should display inserted Reffered Record element', () => {
      expect(noteForm.insertedReferredRecord.isPresent).to.be.true;
    });
  });
});

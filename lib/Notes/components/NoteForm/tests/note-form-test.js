import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from 'mocha';
import {
  Accordion,
  HTML,
  KeyValue,
  including,
} from '@folio/stripes-testing';

import NoteForm from '../NoteForm';
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

const NoteFormInteractor = HTML.extend('Note form')
  .selector('form');

const MockedReferredRecordInteractor = HTML.extend('Referred record')
  .selector('[data-test-inserted-referred-record]')
  .locator(el => el.textContent);

describe('NoteForm', () => {
  const noteForm = NoteFormInteractor();

  describe('rendering NoteForm component', () => {
    setupApplication();

    beforeEach(async () => {
      await mount(<NoteForm {...props} />);
    });

    it('should display NoteForm component', () => noteForm.exists());

    it('assigned accordion should be closed', () => noteForm.find(Accordion(including('Assigned'))).is({ open: false }));

    describe('openening assigned accordion', () => {
      beforeEach(async () => {
        await Accordion(including('Assigned')).open();
      });

      it('should display default Referred Record element', () => KeyValue('Test').exists());
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
      await Accordion(including('Assigned')).open();
    });

    it('should display inserted Reffered Record element', () => MockedReferredRecordInteractor('Test').has({ visible: false }));
  });
});

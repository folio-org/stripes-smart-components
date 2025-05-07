import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from 'mocha';
import { expect } from 'chai';
import { omit } from 'lodash';
import {
  HTML,
  Accordion,
  Button,
  KeyValue,
} from '@folio/stripes-testing';

import NoteView from '../NoteView';
import {
  mount,
  setupApplication,
} from '../../../../../../tests/helpers';

const NoteViewInteractor = HTML.extend('note view')
  .selector('[data-test-note-view]');

const insertedReferredRecord = HTML.extend('inserted referred record')
  .selector('[data-test-inserted-referred-record]');

const NoteContent = KeyValue.extend('note content')
  .filters({
    markup: (el) => el.querySelector('[class^=kvValue]').children[0].innerHTML,
  });

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

const noteWithContentData = {
  ...noteData,
  content: '<strong>Message <em>is</em> <u>rendered</u></strong>',
};

const noteWithSusContentData = {
  ...noteData,
  content: '<strong>Message <em>is</em> <u>rendered</u><a href="javascript:alert("failure")">link</a></strong>',
};

const cleanContent = '<strong>Message <em>is</em> <u>rendered</u><a>link</a></strong>';

describe('NoteView', () => {
  const noteView = NoteViewInteractor();
  const assignedAccordion = Accordion('Assigned');

  describe('rendering NoteView component', () => {
    setupApplication();

    beforeEach(async () => {
      await mount(
        <NoteView
          noteData={noteData}
          entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
          entityTypeTranslationKeys={entityTypeTranslationKeys}
          referredEntityData={referredEntityData}
        />
      );
    });

    it('should display NoteView component', () => noteView.exists());

    it('assigned accordion should be closed', () => assignedAccordion.has({ open: false }));

    it('should display correct note type', () => KeyValue('Note type').has({ value: noteData.type }));

    it('should display correct note title', () => KeyValue('Note title').has({ value: noteData.title }));

    describe('opening the assigned accordion:', () => {
      beforeEach(async () => {
        assignedAccordion.clickHeader();
      });

      it('should display default Referred Record element', () => KeyValue('Test').exists());
    });
  });

  describe('rendering NoteView component without type and title', () => {
    setupApplication();
    const noteDataWithoutTypeAndTitle = omit(noteData, ['type', 'title']);

    beforeEach(async () => {
      await mount(
        <NoteView
          noteData={noteDataWithoutTypeAndTitle}
          entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
          entityTypeTranslationKeys={entityTypeTranslationKeys}
          referredEntityData={referredEntityData}
        />
      );
    });

    it('should display correct note type', () => KeyValue('Note type').has({ value: 'No value set-' }));

    it('should display correct note title', () => KeyValue('Note title').has({ value: 'No value set-' }));
  });

  describe('rendering NoteView component with inserted Referred Record element', () => {
    setupApplication();

    beforeEach(async () => {
      await mount(
        <NoteView
          noteData={noteData}
          entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
          entityTypeTranslationKeys={entityTypeTranslationKeys}
          referredEntityData={referredEntityData}
          renderReferredRecord={() => <div data-test-inserted-referred-record>Test</div>}
        />
      );
      await assignedAccordion.clickHeader();
    });

    it('should display inserted "Referred Record" element', () => insertedReferredRecord().exists());
  });

  describe('rendering NoteView component with content', () => {
    setupApplication();

    beforeEach(async () => {
      await mount(
        <NoteView
          noteData={noteWithContentData}
          entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
          entityTypeTranslationKeys={entityTypeTranslationKeys}
          referredEntityData={referredEntityData}
          renderReferredRecord={() => <div data-test-inserted-referred-record>Test</div>}
        />
      );
    });

    it('should display note content', () => NoteContent('Details').has({ markup: noteWithContentData.content }));
  });

  describe('rendering NoteView component with suspicious content', () => {
    setupApplication();

    beforeEach(async () => {
      await mount(
        <NoteView
          noteData={noteWithSusContentData}
          entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
          entityTypeTranslationKeys={entityTypeTranslationKeys}
          referredEntityData={referredEntityData}
          renderReferredRecord={() => <div data-test-inserted-referred-record>Test</div>}
        />
      );
    });

    it('should screen values for malicious content', () => NoteContent('Details').has({ markup: cleanContent }));
  });
});

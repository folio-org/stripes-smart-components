import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import { omit } from 'lodash';

import NoteView from '../NoteView';
import NoteViewInteractor from './interactor';
import {
  mount,
  setupApplication,
} from '../../../../../../tests/helpers';

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

describe('NoteView', () => {
  const noteView = new NoteViewInteractor();

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

    it('should display NoteView component', () => {
      expect(noteView.isPresent).to.be.true;
    });

    it.skip('assigned accordion should be closed', () => {
      expect(noteView.assignedAccordion.isOpen).to.be.false;
    });

    it('should display default Referred Record element', () => {
      expect(noteView.defaultReferredRecord.isPresent).to.be.true;
    });

    it('should display correct note type', () => {
      expect(noteView.noteType).to.equal(noteData.type);
    });

    it('should display correct note title', () => {
      expect(noteView.noteTitle).to.equal(noteData.title);
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

    it('should display correct note type', () => {
      expect(noteView.noteType).to.equal('-');
    });

    it('should display correct note title', () => {
      expect(noteView.noteTitle).to.equal('-');
    });
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
    });

    it('should display inserted Reffered Record element', () => {
      expect(noteView.insertedReferredRecord.isPresent).to.be.true;
    });
  });
});

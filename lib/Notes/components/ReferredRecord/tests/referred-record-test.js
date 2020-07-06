import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import ReferredRecord from '../ReferredRecord';
import ReferredRecordInteractor from './interactor';
import {
  mount,
  setupApplication,
} from '../../../../../tests/helpers';


describe('ReferredRecord', () => {
  const referredRecord = new ReferredRecordInteractor();
  const referredEntityData = {
    name: 'Test Name',
    type: 'Type',
    id: '1',
  };
  const entityTypeTranslationKeys = { [referredEntityData.type]: 'Test' };

  setupApplication();

  describe('rendering referredRecord component', () => {
    beforeEach(() => {
      mount(
        <ReferredRecord
          entityTypeTranslationKeys={entityTypeTranslationKeys}
          referredEntityData={referredEntityData}
        />
      );
    });

    it('should display referredRecord component', () => {
      expect(referredRecord.isPresent).to.be.true;
    });

    it('should display correct title', () => {
      expect(referredRecord.referredEntityType).to.equal(entityTypeTranslationKeys[referredEntityData.type]);
    });

    it('should display correct name', () => {
      expect(referredRecord.referredEntityName).to.equal(referredEntityData.name);
    });
  });
});

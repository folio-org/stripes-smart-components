import React from 'react';
import {
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import ReferredRecord from '../ReferredRecord';
import ReferredRecordInteractor from './interactor';
import { setupApplication } from '../../../../../tests/helpers';

describe('ReferredRecord', () => {
  const referredRecord = new ReferredRecordInteractor();
  const referredEntityData = {
    name: 'Test Name',
    type: 'Type',
    id: '1',
  };
  const entityTypeTranslationKeys = { [referredEntityData.type]: 'Test' };

  setupApplication({
    component: <ReferredRecord
      entityTypeTranslationKeys={entityTypeTranslationKeys}
      referredEntityData={referredEntityData}
    />
  });

  describe('rendering referredRecord component', () => {
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

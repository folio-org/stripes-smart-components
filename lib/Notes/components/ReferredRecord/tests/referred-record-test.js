import React from 'react';
import {
  describe,
  it,
} from 'mocha';

import {
  KeyValue
} from '@folio/stripes-testing';

import ReferredRecord from '../ReferredRecord';
import { setupApplication } from '../../../../../tests/helpers';

describe('ReferredRecord', () => {
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
    it('should display referredRecord component', () => KeyValue(entityTypeTranslationKeys[referredEntityData.type]).exists());

    it('should display correct name', () => KeyValue(entityTypeTranslationKeys[referredEntityData.type]).has({ value: referredEntityData.name }));
  });
});

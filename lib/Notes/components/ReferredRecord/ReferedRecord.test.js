import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import 'jest-dom/extend-expect';
import { IntlProvider } from 'react-intl';
import '@testing-library/react/cleanup-after-each';

import ReferredRecord from './ReferredRecord';

const entityTypeTranslationKeys = {
  package: 'ui-eholdings.notes.entityType.package',
};

const renderComponent = () => render(
  <IntlProvider
    locale="en"
    messages={{ 'ui-eholdings.notes.entityType.package': 'Package' }}
  >
    <ReferredRecord
      entityTypeTranslationKeys={entityTypeTranslationKeys}
      referredEntityData={{
        id: '123',
        name: 'Some name',
        type: 'package'
      }}
    />
  </IntlProvider>
);

describe('ReferredRecord', () => {
  let getByTestId;

  beforeEach(() => {
    getByTestId = renderComponent().getByTestId;
  });

  it('should render referred entity name', () => {
    const entityTypeWrapper = getByTestId('entityName');
    const entityName = entityTypeWrapper.innerHTML;

    expect(entityName).toBe('Some name');
  });

  it('should render referred entity type', () => {
    const entityTypeWrapper = getByTestId('entityType').getElementsByTagName('span')[0];
    const entityType = entityTypeWrapper.innerHTML;

    expect(entityType).toBe('Package');
  });

});

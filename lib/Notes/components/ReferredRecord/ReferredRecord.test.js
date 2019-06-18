import React from 'react';
import { render } from '@testing-library/react';
import 'jest-dom/extend-expect';
import { IntlProvider } from 'react-intl';
import '@testing-library/react/cleanup-after-each';

import ReferredRecord from './ReferredRecord';

const translations = {
  'package-translation-key': 'Package'
};

const entityTypeTranslationKeys = {
  package: 'package-translation-key',
};

const referredEntityData = {
  id: '123',
  name: 'Some name',
  type: 'package'
};

const renderComponent = () => render(
  <IntlProvider
    locale="en"
    messages={translations}
  >
    <ReferredRecord
      entityTypeTranslationKeys={entityTypeTranslationKeys}
      referredEntityData={referredEntityData}
    />
  </IntlProvider>
);

describe('ReferredRecord', () => {
  let container, getByTestId;

  beforeEach(() => {
    ({ container, getByTestId } = renderComponent());
  });

  it('should match snapshot', () => {
    expect(container).toMatchSnapshot();
  });

  it('should render referred entity name', () => {
    const entityNameWrapper = getByTestId('entityName');
    const entityName = entityNameWrapper.textContent;

    expect(entityName).toBe(referredEntityData.name);
  });

  it('should render referred entity type', () => {
    const entityTypeWrapper = getByTestId('entityType').getElementsByTagName('span')[0];
    const entityType = entityTypeWrapper.textContent;

    expect(entityType).toBe(translations[entityTypeTranslationKeys[referredEntityData.type]]);
  });
});

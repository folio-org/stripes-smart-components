/**
 * IntlHarness
 *
 * Wrapper component that can be used for testing
 * components that rely on react-intl.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { mapKeys } from 'lodash';
import messages from '../translations/stripes-smart-components/en_US';

const IntlHarness = ({ children }) => (
  <IntlProvider
    locale="en-US"
    messages={mapKeys(messages, key => `stripes-smart-components.${key}`)}
  >
    {children}
  </IntlProvider>
);

IntlHarness.propTypes = {
  children: PropTypes.node,
};

export default IntlHarness;

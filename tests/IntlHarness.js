/**
 * IntlHarness
 *
 * Wrapper component that can be used for testing
 * components that rely on react-intl.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import messages from '../translations/stripes-smart-components/en_US';

const IntlHarness = ({ children }) => (
  <IntlProvider
    locale="en-US"
    messages={messages}
  >
    {children}
  </IntlProvider>
);

IntlHarness.propTypes = {
  children: PropTypes.node,
};

export default IntlHarness;

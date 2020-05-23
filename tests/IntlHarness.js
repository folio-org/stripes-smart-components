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

/**
 * mimics the StripesTranslationPlugin in @folio/stripes-core:
 * given a list of key-value pairs like {"foo": "bar"} and a prefix,
 * return {"prefix.foo": "bar", ...}.
 *
 * @param {*} obj map of key-value pairs
 * @param {*} prefix module-path to prepend to each key
 */
function prefixKeys(obj, prefix) {
  const res = {};
  for (const key of Object.keys(obj)) {
    res[`${prefix}.${key}`] = obj[key];
  }
  return res;
}

const IntlHarness = ({ children }) => (
  <IntlProvider
    locale="en-US"
    messages={prefixKeys(messages, 'stripes-smart-components')}
  >
    {children}
  </IntlProvider>
);

IntlHarness.propTypes = {
  children: PropTypes.node,
};

export default IntlHarness;

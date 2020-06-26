/**
 * CalloutHarness
 *
 * Wrapper component that can be used for testing
 * components that rely on a callout.
 */

import React from 'react';
import PropTypes from 'prop-types';
import CalloutContext from '@folio/stripes-core';
import { Callout } from '@folio/stripes-components';

const CalloutHarness = ({ children }) => {
  const calloutRef = React.createRef();

  return (
    <>
      <CalloutContext.Provider value={calloutRef.current}>
        {children}
      </CalloutContext.Provider>
      <Callout ref={calloutRef} />
    </>
  );
};

CalloutHarness.propTypes = {
  children: PropTypes.node,
};

export default CalloutHarness;

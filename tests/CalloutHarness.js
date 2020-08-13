/**
 * CalloutHarness
 *
 * Wrapper component that can be used for testing
 * components that rely on a callout.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Callout } from '@folio/stripes-components';

const CalloutHarness = ({ children }) => {
  const calloutRef = React.createRef();
  const CalloutContext = React.createContext();

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

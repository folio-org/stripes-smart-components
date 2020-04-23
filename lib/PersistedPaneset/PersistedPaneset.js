import React from 'react';
import PropTypes from 'prop-types';
import { useLocalStorage, writeStorage } from '@rehooks/local-storage';

import { Paneset } from '@folio/stripes-components';

const propTypes = {
  appId: PropTypes.string.isRequired,
  children: PropTypes.node,
  id: PropTypes.string.isRequired,
};

const PersistedPaneset = ({
  appId,
  children,
  id: panesetId,
}) => {
  const persistKey = `${appId}/${panesetId}/layout`;
  const [storedPanesetLayout] = useLocalStorage(persistKey);

  return (
    <Paneset
      id={panesetId}
      initialLayouts={storedPanesetLayout}
      onResize={({ layoutCache }) => {
        // We don't want to persist any layout that contains a NaN so filter those out first.
        const persistedLayoutCache = layoutCache.filter(layout => {
          const widths = Object.values(layout);
          const hasNaN = widths.some(width => width.includes('NaN'));
          return !hasNaN;
        });

        writeStorage(persistKey, persistedLayoutCache);
      }}
    >
      {children}
    </Paneset>
  );
};

PersistedPaneset.propTypes = propTypes;
export default PersistedPaneset;

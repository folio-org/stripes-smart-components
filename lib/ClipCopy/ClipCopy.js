import React, {
  useContext,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
  useIntl
} from 'react-intl';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import {
  CalloutContext,
} from '@folio/stripes-core';
import {
  IconButton,
} from '@folio/stripes-components';

const ClipCopy = ({ text }) => {
  const callout = useContext(CalloutContext);
  const intl = useIntl();
  const handleCopy = useCallback(() => {
    callout.sendCallout({
      type: 'success',
      message: intl.formatMessage(
        { id: 'stripes-smart-components.clipCopy.success' },
        { text }
      ),
    });
  }, [text, callout, intl]);

  return (
    <CopyToClipboard
      text={text}
      onCopy={handleCopy}
    >
      <span data-test-copy-icon>
        <IconButton icon="clipboard" />
      </span>
    </CopyToClipboard>
  );
};

ClipCopy.propTypes = {
  text: PropTypes.string.isRequired,
};

export default ClipCopy;

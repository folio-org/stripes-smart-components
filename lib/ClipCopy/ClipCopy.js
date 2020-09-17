import React, {
  useContext,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
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
  const handleCopy = useCallback(() => {
    callout.sendCallout({
      type: 'success',
      message: (
        <FormattedMessage
          id="stripes-smart-components.clipCopy.success"
          values={{ text }}
        />)
    });
  }, [text, callout]);

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

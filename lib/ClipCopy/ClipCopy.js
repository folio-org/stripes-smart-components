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
          id="stripes-smart-components.successfullyCopiedMessage"
          values={{ text }}
        />)
    });
  }, [text, callout]);

  return (
    <CopyToClipboard
      text={text}
      onCopy={handleCopy}
    >
      <div data-test-items-copy-icon>
        <IconButton icon="clipboard" />
      </div>
    </CopyToClipboard>
  );
};

ClipCopy.propTypes = {
  text: PropTypes.string.isRequired,
};

export default ClipCopy;

import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

const useLoadingErrorCallout = hasError => {
  const calloutRef = useRef();
  const showErrorNotification = () => {
    calloutRef.current.sendCallout({
      type: 'error',
      message: (<FormattedMessage id="stripes-smart-components.customFields.errorOccurred" />)
    });
  };

  useEffect(() => {
    if (hasError) {
      showErrorNotification();
    }
  }, [hasError]);

  return { calloutRef, showErrorNotification };
};

export default useLoadingErrorCallout;

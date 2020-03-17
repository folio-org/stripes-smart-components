import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

const useLoadingErrorCallout = hasError => {
  console.log(hasError);
  const calloutRef = useRef();
  console.log(calloutRef);
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

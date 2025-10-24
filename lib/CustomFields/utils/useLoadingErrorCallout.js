import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

const useLoadingErrorCallout = ({ 
  customFieldsFetchFailed,
  sectionTitleFetchFailed,
  optionsStatsFetchFailed,
}) => {
  const calloutRef = useRef();

  const showCustomFieldsUpdateErrorNotification = () => {
    calloutRef.current.sendCallout({
      type: 'error',
      message: (<FormattedMessage id="stripes-smart-components.customFields.errorOccurred" />)
    });
  };

  const showCustomFieldsRetrieveErrorNotification = () => {
    calloutRef.current.sendCallout({
      type: 'error',
      message: (<FormattedMessage id="stripes-smart-components.customFields.error.get" />)
    });
  };

  const showSectionTitleRetrieveErrorNotification = () => {
    calloutRef.current.sendCallout({
      type: 'error',
      message: (<FormattedMessage id="stripes-smart-components.sectionTitle.error.get" />)
    });
  };

  const hasCustomFieldsRetrievalError = customFieldsFetchFailed || optionsStatsFetchFailed;

  useEffect(() => {
    if (hasCustomFieldsRetrievalError) {
      showCustomFieldsRetrieveErrorNotification();
    }
  }, [hasCustomFieldsRetrievalError]);

  useEffect(() => {
    if (sectionTitleFetchFailed) {
      showSectionTitleRetrieveErrorNotification();
    }
  }, [sectionTitleFetchFailed]);

  return { 
    calloutRef,
    showErrorNotification: showCustomFieldsUpdateErrorNotification,
  };
};

export default useLoadingErrorCallout;

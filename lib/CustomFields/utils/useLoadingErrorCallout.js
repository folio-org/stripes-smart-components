import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { useCallout } from '@folio/stripes-core';

const useLoadingErrorCallout = ({
  customFieldsFetchFailed,
  sectionTitleFetchFailed,
  optionsStatsFetchFailed,
}) => {
  const callout = useCallout();

  const showCustomFieldsUpdateErrorNotification = () => {
    callout.sendCallout({
      dedupe: true,
      type: 'error',
      message: (<FormattedMessage id="stripes-smart-components.customFields.errorOccurred" />)
    });
  };

  const hasCustomFieldsRetrievalError = customFieldsFetchFailed || optionsStatsFetchFailed;

  useEffect(() => {
    if (hasCustomFieldsRetrievalError) {
      callout.sendCallout({
        dedupe: true,
        type: 'error',
        message: (<FormattedMessage id="stripes-smart-components.customFields.error.get" />)
      });
    }
  }, [hasCustomFieldsRetrievalError, callout]);

  useEffect(() => {
    if (sectionTitleFetchFailed) {
      callout.sendCallout({
        dedupe: true,
        type: 'error',
        message: (<FormattedMessage id="stripes-smart-components.customFields.sectionTitle.error.get" />)
      });
    }
  }, [sectionTitleFetchFailed, callout]);

  return {
    showErrorNotification: showCustomFieldsUpdateErrorNotification,
  };
};

export default useLoadingErrorCallout;

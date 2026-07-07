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

  const showCustomFieldsRetrieveErrorNotification = () => {
    callout.sendCallout({
      dedupe: true,
      type: 'error',
      message: (<FormattedMessage id="stripes-smart-components.customFields.error.get" />)
    });
  };

  const showSectionTitleRetrieveErrorNotification = () => {
    callout.sendCallout({
      dedupe: true,
      type: 'error',
      message: (<FormattedMessage id="stripes-smart-components.customFields.sectionTitle.error.get" />)
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
    showErrorNotification: showCustomFieldsUpdateErrorNotification,
  };
};

export default useLoadingErrorCallout;

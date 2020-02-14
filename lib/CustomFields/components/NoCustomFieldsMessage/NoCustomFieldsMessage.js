import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Icon } from '@folio/stripes-components';

import css from './NoCustomFieldsMessage.css';

const NoCustomFieldsMessage = () => (
  <div className={css.wrapper}>
    <div className={css.noResultsMessage}>
      <Icon iconRootClass={css.noResultsMessageIcon} icon="arrow-up" size="large" />
      <span className={css.noResultsMessageLabel}>
        <FormattedMessage id="stripes-smart-components.customFields.clickNewToCreate" />
      </span>
    </div>
  </div>
);

export default NoCustomFieldsMessage;

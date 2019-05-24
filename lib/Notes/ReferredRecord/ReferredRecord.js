import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { KeyValue } from '@folio/stripes-components';

import styles from './ReferredRecord.css';

import { referredEntityDataShape } from '../NoteForm/noteShapes';

const ReferredRecord = (props) => {
  const {
    referredEntityData: {
      name,
      type,
    },
    entityTypeTranslationKeys,
  } = props;

  const entityType = (
    <span className={styles['referred-record__entity-type']}>
      <FormattedMessage id={entityTypeTranslationKeys[type]} />
    </span>
  );

  return (
    <KeyValue label={entityType}>
      {name}
    </KeyValue>
  );
};

ReferredRecord.propTypes = {
  entityTypeTranslationKeys: PropTypes.objectOf(PropTypes.string),
  referredEntityData: referredEntityDataShape.isRequired,
};

export default ReferredRecord;

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { KeyValue } from '@folio/stripes-components';

import { referredEntityDataShape } from '../NoteForm/noteShapes';

import styles from './ReferredRecord.css';

const ReferredRecord = (props) => {
  const {
    referredEntityData: {
      name,
      type,
    },
    entityTypeTranslationKeys,
  } = props;

  const entityType = (
    <span
      data-test-referred-entity-type
      className={styles['referred-record__entity-type']}
    >
      <FormattedMessage id={entityTypeTranslationKeys[type]} />
    </span>
  );

  return (
    <KeyValue label={entityType}>
      <span data-test-referred-entity-name>
        {name}
      </span>
    </KeyValue>
  );
};

ReferredRecord.propTypes = {
  entityTypeTranslationKeys: PropTypes.objectOf(PropTypes.string),
  referredEntityData: referredEntityDataShape.isRequired,
};

export default ReferredRecord;

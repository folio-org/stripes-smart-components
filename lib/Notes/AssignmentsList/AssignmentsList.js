import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { capitalize } from 'lodash';

import {
  KeyValue,
  List,
} from '@folio/stripes/components';

import styles from './AssignmentsList.css';

export default class AssignedList extends Component {
  static propTypes = {
    entityTypeTranslations: PropTypes.objectOf(PropTypes.string),
    linkedRecords: PropTypes.arrayOf(PropTypes.shape({
      count: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    })),
    referredRecord: PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    linkedRecords: [],
  };

  renderReferredRecord = () => {
    const {
      referredRecord: {
        name,
        type,
      },
      entityTypeTranslations,
    } = this.props;

    const entityType = (
      <FormattedMessage
        id={entityTypeTranslations[type]}
        values={{ count: 1 }}
      >
        {translatedEntityType => (
          <span className={styles['referred-record__entity-type']}>
            {capitalize(translatedEntityType)}
          </span>
        )}
      </FormattedMessage>
    );

    return (
      <KeyValue label={entityType}>
        {name}
      </KeyValue>

    );
  }

  renderEntityTypesAssignmentsList = () => {
    const listItems = this.getListItems();

    return (
      <List
        items={listItems}
        listStyle="bullets"
      />
    );
  }

  getListItems() {
    const {
      linkedRecords,
      entityTypeTranslations,
    } = this.props;

    return linkedRecords.map(({ count, type }) => (
      <span className={styles['assignments-list__item']}>
        {count}
        &nbsp;
        <FormattedMessage
          id={entityTypeTranslations[type]}
          values={{ count }}
        />
      </span>
    ));
  }

  render() {
    return (
      <Fragment>
        {this.renderReferredRecord()}
        {this.renderEntityTypesAssignmentsList()}
      </Fragment>
    );
  }
}

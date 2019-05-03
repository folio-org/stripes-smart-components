import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  KeyValue,
  List,
} from '@folio/stripes-components';

import styles from './AssignmentsList.css';

import {
  referredRecordShape,
  linkedRecordsShape,
} from '../NoteForm/noteShapes';

export default class AssignmentsList extends Component {
  static propTypes = {
    entityTypePluralizedTranslationKeyMap: PropTypes.objectOf(PropTypes.string),
    entityTypeTranslationKeyMap: PropTypes.objectOf(PropTypes.string),
    linkedRecords: linkedRecordsShape,
    referredRecord: referredRecordShape.isRequired,
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
      entityTypeTranslationKeyMap,
    } = this.props;

    const entityType = <FormattedMessage id={entityTypeTranslationKeyMap[type]} />;

    return (
      <KeyValue label={entityType}>
        {name}
      </KeyValue>

    );
  }

  renderEntityTypesAssignmentsList = () => {
    return (
      <List
        items={this.getListItems()}
        listStyle="bullets"
      />
    );
  }

  getListItems() {
    const {
      linkedRecords,
      entityTypePluralizedTranslationKeyMap,
    } = this.props;

    return linkedRecords.map(({ count, type }) => (
      <span className={styles['assignments-list__item']}>
        <FormattedMessage
          id={entityTypePluralizedTranslationKeyMap[type]}
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

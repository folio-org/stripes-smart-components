import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  KeyValue,
  List,
} from '@folio/stripes-components';

import styles from './AssignmentsList.css';

import {
  referredEntityDataShape,
  linkedEntityTypesShape,
} from '../NoteForm/noteShapes';

export default class AssignmentsList extends Component {
  static propTypes = {
    entityTypesPluralizedTranslationKeys: PropTypes.objectOf(PropTypes.string),
    entityTypesTranslationKeys: PropTypes.objectOf(PropTypes.string),
    linkedEntityTypes: linkedEntityTypesShape,
    referredEntityData: referredEntityDataShape.isRequired,
  };

  static defaultProps = {
    linkedEntityTypes: [],
  };

  renderReferredRecord = () => {
    const {
      referredEntityData: {
        name,
        type,
      },
      entityTypesTranslationKeys,
    } = this.props;

    const entityType = (
      <span className={styles['referred-record__entity-type']}>
        <FormattedMessage id={entityTypesTranslationKeys[type]} />
      </span>
    );

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
      linkedEntityTypes,
      entityTypesPluralizedTranslationKeys,
    } = this.props;

    return linkedEntityTypes.map(({ count, type }) => (
      <span className={styles['assignments-list__item']}>
        <FormattedMessage
          id={entityTypesPluralizedTranslationKeys[type]}
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

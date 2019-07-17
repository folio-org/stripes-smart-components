import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { List } from '@folio/stripes-components';
import getLinkedEntityTypesArr from '../../utils/getLinkedEntityTypesArr';

export default class AssignmentsList extends Component {
  static propTypes = {
    entityTypePluralizedTranslationKeys: PropTypes.objectOf(PropTypes.string),
    links: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })).isRequired,
  };

  getListItems() {
    const {
      links,
      entityTypePluralizedTranslationKeys,
    } = this.props;
    const linkedEntityTypes = getLinkedEntityTypesArr(links);

    return linkedEntityTypes.map(({ count, type }) => (
      <FormattedMessage
        id={entityTypePluralizedTranslationKeys[type]}
        values={{ count }}
      />
    ));
  }

  render() {
    return (
      <List
        items={this.getListItems()}
        listStyle="bullets"
      />
    );
  }
}

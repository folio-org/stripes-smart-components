import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isEqual } from 'lodash';

import { MetaSection } from '@folio/stripes-components';
import { stripesConnect } from '@folio/stripes-core';

class ViewMetaData extends React.Component {
  static manifest = Object.freeze({
    updaters: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      GET: {
        params: {
          query: (queryParams, pathComponents, resourceValues) => {
            if (resourceValues.updaterIds && resourceValues.updaterIds.length) {
              return `(${resourceValues.updaterIds.join(' or ')})`;
            }
            return null;
          },
        }
      }
    },
    updaterIds: [],
  });

  static propTypes = {
    metadata: PropTypes.object,
    mutator: PropTypes.shape({
      updaterIds: PropTypes.object,
      updaters: PropTypes.object,
    }).isRequired,
    resources: PropTypes.shape({
      updaterIds: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.string)]),
      updaters: PropTypes.object,
    }).isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    systemId: PropTypes.string,
    systemUser: PropTypes.oneOfType([
      PropTypes.shape({
        id: PropTypes.string,
        personal: PropTypes.shape({
          firstName: PropTypes.string,
          lastName: PropTypes.string,
          middleName: PropTypes.string,
        }),
      }),
      PropTypes.node,
    ]),
  };

  static defaultProps = {
    metadata: {},
    systemUser: <FormattedMessage id="stripes-smart-components.system" />,
  };

  /**
   * If the user has permission, push the metadata-userIds into the
   * updaterIds resource in order to cause that query to fire.
   */
  componentDidUpdate() {
    const { stripes, metadata } = this.props;
    if (stripes.hasPerm('ui-users.view')) {
      const userIds = [
        `id=="${metadata.createdByUserId}"`,
        `id=="${metadata.updatedByUserId}"`,
      ];

      if (!isEqual(userIds, this.props.resources.updaterIds)) {
        this.props.mutator.updaterIds.replace(userIds);
      }
    }
  }

  renderUser = (userId) => {
    const { systemId, systemUser } = this.props;
    if (systemId && systemId === userId) {
      return systemUser;
    }

    const updaters = (this.props.resources.updaters || {}).records || [];
    return updaters.find(r => r.id === userId);
  }

  render() {
    const { metadata } = this.props;

    return (
      <MetaSection
        id="instanceRecordMeta"
        contentId="instanceRecordMetaContent"
        createdBy={this.renderUser(metadata.createdByUserId)}
        lastUpdatedBy={this.renderUser(metadata.updatedByUserId)}
        createdDate={metadata.createdDate}
        lastUpdatedDate={metadata.updatedDate}
      />
    );
  }
}

export default stripesConnect(ViewMetaData);

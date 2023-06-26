import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import { MetaSection } from '@folio/stripes-components';
import { stripesConnect } from '@folio/stripes-core';

class ViewMetaData extends React.Component {
  static manifest = Object.freeze({
    updaters: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      params: (_q, _p, _r, _l, props) => {
        const cId = get(props, 'metadata.createdByUserId');
        const uId = get(props, 'metadata.updatedByUserId');

        const userIds = [];
        if (cId && cId !== props.systemId) userIds.push(cId);
        if (uId && uId !== props.systemId) userIds.push(uId);
        const query = [
          ...new Set(userIds.map(i => `id==${i}`))
        ].join(' or ');

        return query ? { query } : null;
      },
      permissionsRequired: ['users.collection.get'],
    },
  });

  static propTypes = {
    contentId: PropTypes.string,
    headingLevel: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
    id: PropTypes.string,
    inlineLayout: PropTypes.bool,
    metadata: PropTypes.object,
    mutator: PropTypes.shape({
      updaters: PropTypes.object,
    }).isRequired,
    noBackGround: PropTypes.bool,
    resources: PropTypes.shape({
      updaters: PropTypes.object,
    }).isRequired,
    showUserLink: PropTypes.bool,
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
    useAccordion: PropTypes.bool,
  };

  static defaultProps = {
    metadata: {},
    systemUser: <FormattedMessage id="stripes-smart-components.system" />,
    showUserLink: true,
  };

  renderUser = (userId) => {
    const { systemId, systemUser } = this.props;
    if (systemId && systemId === userId) {
      return systemUser;
    }

    const updaters = (this.props.resources.updaters || {}).records || [];
    return updaters.find(r => r.id === userId);
  }

  render() {
    const {
      metadata,
      headingLevel,
      id,
      contentId,
      showUserLink,
      noBackGround,
      useAccordion,
      inlineLayout,
    } = this.props;

    return (
      <MetaSection
        id={id}
        contentId={contentId}
        showUserLink={showUserLink}
        headingLevel={headingLevel}
        createdBy={this.renderUser(metadata.createdByUserId)}
        lastUpdatedBy={this.renderUser(metadata.updatedByUserId)}
        createdDate={metadata.createdDate}
        lastUpdatedDate={metadata.updatedDate}
        useAccordion={useAccordion}
        noBackGround={noBackGround}
        inlineLayout={inlineLayout}
      />
    );
  }
}

export default stripesConnect(ViewMetaData);

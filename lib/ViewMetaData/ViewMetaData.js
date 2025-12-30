import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import { MetaSection } from '@folio/stripes-components';
import { stripesConnect } from '@folio/stripes-core';

const ViewMetaData = ({
  contentId,
  headingLevel,
  id,
  inlineLayout,
  mutator,
  noBackGround,
  resources,
  systemId,
  useAccordion,
  children,
  metadata = {},
  systemUser = <FormattedMessage id="stripes-smart-components.system" />,
  showUserLink = true,
}) => {
  useEffect(() => {
    if (!metadata.createdByUserId && !metadata.updatedByUserId) {
      return;
    }

    mutator.updaters.GET().catch(() => {
      // Silently handle fetch errors that may occur during tenant switching
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata.createdByUserId, metadata.updatedByUserId]);

  const renderUser = useCallback((userId) => {
    if (systemId && systemId === userId) {
      return systemUser;
    }

    const updaters = (resources.updaters || {}).records || [];
    return updaters.find(r => r.id === userId);
  }, [resources.updaters, systemId, systemUser]);

  if (children) {
    return children({
      lastUpdatedBy : renderUser(metadata.updatedByUserId)
    });
  }

  return (
    <MetaSection
      id={id}
      contentId={contentId}
      showUserLink={showUserLink}
      headingLevel={headingLevel}
      createdBy={renderUser(metadata.createdByUserId)}
      lastUpdatedBy={renderUser(metadata.updatedByUserId)}
      createdDate={metadata.createdDate}
      lastUpdatedDate={metadata.updatedDate}
      useAccordion={useAccordion}
      noBackGround={noBackGround}
      inlineLayout={inlineLayout}
    />
  );
};

ViewMetaData.manifest = Object.freeze({
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
    accumulate: true,
    throwErrors: false,
  },
});

ViewMetaData.propTypes = {
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
  children: PropTypes.func,
};

export default stripesConnect(ViewMetaData);

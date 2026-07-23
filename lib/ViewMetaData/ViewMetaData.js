import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { MetaSection } from '@folio/stripes-components';

import { useUpdatersQuery } from './useUpdatersQuery';

const ViewMetaData = ({
  children,
  contentId,
  headingLevel,
  id,
  inlineLayout,
  metadata = {},
  noBackGround,
  showUserLink = true,
  systemId,
  systemUser = <FormattedMessage id="stripes-smart-components.system" />,
  tenantId,
  useAccordion,
}) => {
  // Extract unique user IDs, excluding the system ID
  const userIds = useMemo(() => {
    return [metadata.createdByUserId, metadata.updatedByUserId]
      .filter(Boolean)
      .filter((el) => el !== systemId);
  }, [metadata.createdByUserId, metadata.updatedByUserId, systemId]);

  const {
    isLoading,
    updaters,
  } = useUpdatersQuery(userIds, { tenantId });

  const renderUser = useCallback((userId) => {
    if (systemId && systemId === userId) {
      return systemUser;
    }

    return updaters.find(r => r.id === userId);
  }, [systemId, systemUser, updaters]);

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
      isLoading={isLoading}
    />
  );
};

ViewMetaData.propTypes = {
  children: PropTypes.func,
  contentId: PropTypes.string,
  headingLevel: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  id: PropTypes.string,
  inlineLayout: PropTypes.bool,
  metadata: PropTypes.shape({
    createdByUserId: PropTypes.string,
    createdDate: PropTypes.string,
    updatedByUserId: PropTypes.string,
    updatedDate: PropTypes.string,
  }),
  noBackGround: PropTypes.bool,
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
  tenantId: PropTypes.string,
  useAccordion: PropTypes.bool,
};

export default ViewMetaData;

const getMetadataPropsFromResponse = (responseMetadata) => {
  const {
    createdDate,
    createdByUsername: createdBy,
    updatedByUsername,
    updatedDate: lastUpdatedDate,
    updatedByUserId,
    createdByUserId,
  } = responseMetadata;

  const lastUpdatedBy = createdByUserId === updatedByUserId
    ? createdBy
    : updatedByUsername;

  const metadataProps = {};

  if (createdDate) { metadataProps.createdDate = createdDate; }
  if (createdBy) { metadataProps.createdBy = createdBy; }
  if (lastUpdatedDate) { metadataProps.lastUpdatedDate = lastUpdatedDate; }
  if (lastUpdatedBy) { metadataProps.lastUpdatedBy = lastUpdatedBy; }

  return metadataProps;
};

export default getMetadataPropsFromResponse;

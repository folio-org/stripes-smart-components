const getMetadataPropsFromResponse = (responseMetadata) => {
  const {
    createdDate,
    createdByUsername: createdBy,
    updatedDate: lastUpdatedDate,
    updatedByUserId: lastUpdatedBy
  } = responseMetadata;

  const metadataProps = {};

  if (createdDate) { metadataProps.createdDate = createdDate; }
  if (createdBy) { metadataProps.createdBy = createdBy; }
  if (lastUpdatedDate) { metadataProps.lastUpdatedDate = lastUpdatedDate; }
  if (lastUpdatedBy) { metadataProps.lastUpdatedBy = lastUpdatedBy; }

  return metadataProps;
};

export default getMetadataPropsFromResponse;

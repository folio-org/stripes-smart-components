const getMetadataPropsFromResponse = (responseMetadata) => {
  const {
    createdDate,
    createdByUsername: createdBy,
    updatedByUsername,
    updatedDate: lastUpdatedDate,
  } = responseMetadata;

  const metadataProps = {};

  if (createdDate) { metadataProps.createdDate = createdDate; }
  if (createdBy) { metadataProps.createdBy = createdBy; }
  if (lastUpdatedDate) { metadataProps.lastUpdatedDate = lastUpdatedDate; }
  if (updatedByUsername) { metadataProps.lastUpdatedBy = updatedByUsername; }

  return metadataProps;
};

export default getMetadataPropsFromResponse;

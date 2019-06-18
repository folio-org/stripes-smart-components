import getMetadataFromResponse from './getMetadataFormResponse';

describe('getMetadataFromResponse', () => {
  describe('when the response contains all the metadata fields', () => {
    const responseMetadata = {
      createdDate: 'yesterday',
      createdByUsername: 'diku',
      updatedDate: 'yesterday',
      updatedByUserId: 'x21091-djasdf'
    };

    const expectedMetaSectionProps = {
      createdDate: 'yesterday',
      createdBy: 'diku',
      lastUpdatedDate: 'yesterday',
      lastUpdatedBy: 'x21091-djasdf',
    };

    const retrievedMetaSectionProps = getMetadataFromResponse(responseMetadata);

    it('should correctly transform response metadata to MetaSection props', () => {
      expect(retrievedMetaSectionProps).toEqual(expectedMetaSectionProps);
    });
  });

  describe('when the response contains not all metadata fields', () => {
    describe('should correctly transform response metadata to MetaSection props', () => {
      const responseMetadata = {
        createdByUsername: 'diku',
        updatedDate: 'yesterday',
      };

      const expectedMetaSectionProps = {
        createdBy: 'diku',
        lastUpdatedDate: 'yesterday',
      };

      const retrievedMetaSectionProps = getMetadataFromResponse(responseMetadata);

      it('should correctly transform response metadata to MetaSection props', () => {
        expect(retrievedMetaSectionProps).toEqual(expectedMetaSectionProps);
      });
    });
  });
});

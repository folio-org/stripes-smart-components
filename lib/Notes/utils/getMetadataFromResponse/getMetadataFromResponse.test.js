import getMetadataFromResponse from './getMetadataFormResponse';

describe('getMetadataFromResponse', () => {
  describe('when the response contains all metadata fields', () => {
    const responseMetadata = {
      createdDate: '1',
      createdByUsername: 'createdBy',
      updatedDate: 'lastUpdatedDate',
      updatedByUserId: 'lastUpdatedBy'
    };

    const expectedTransformedMetadata = {
      createdDate: '1',
      createdBy: 'createdBy',
      lastUpdatedDate: 'lastUpdatedDate',
      lastUpdatedBy: 'lastUpdatedBy',
    };

    const transformedMetadata = getMetadataFromResponse(responseMetadata);

    it('should correctly transform response metadata to MetaSection props', () => {
      expect(transformedMetadata).toEqual(expectedTransformedMetadata);
    });
  });

  describe('when the response contains not all metadata fields', () => {
    describe('should correctly transform response metadata to MetaSection props', () => {
      const responseMetadata = {
        createdDate: '1',
        createdByUsername: 'createdBy',
        updatedByUserId: 'lastUpdatedBy'
      };

      const expectedTransformedMetadata = {
        createdDate: '1',
        createdBy: 'createdBy',
        lastUpdatedBy: 'lastUpdatedBy',
      };

      const transformedMetadata = getMetadataFromResponse(responseMetadata);

      it('should correctly transform response metadata to MetaSection props', () => {
        expect(transformedMetadata).toEqual(expectedTransformedMetadata);
      });
    });
  });
});

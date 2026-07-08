import processBadResponse from './processBadResponse';
import { errorCodes } from './constants';

const createResponse = (status, json = jest.fn()) => ({
  status,
  json,
});

describe('processBadResponse', () => {
  it('maps 422 duplicate-name errors into field and common error messages', async () => {
    const response = createResponse(422, jest.fn().mockResolvedValue({
      errors: [
        {
          code: errorCodes.nameDuplicate,
          parameters: [
            { key: 'fieldLabel', value: 'Name' },
            { key: 'duplicateValue', value: 'alpha' },
          ],
        },
        {
          code: errorCodes.nameDuplicate,
          parameters: [
            { key: 'fieldLabel', value: 'Name' },
          ],
        },
        {
          code: 'some.other.error',
        },
      ],
    }));

    const result = await processBadResponse(response, errorCodes.defaultSaveError);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(result.fieldErrors.Name).toHaveLength(2);
    expect(result.fieldErrors.Name[0].props).toMatchObject({
      id: 'stripes-smart-components.error.name.duplicate',
      values: {
        fieldLabel: 'Name',
        duplicateValue: 'alpha',
      },
    });
    expect(result.fieldErrors.Name[1].props).toMatchObject({
      id: 'stripes-smart-components.error.name.duplicate',
      values: {
        fieldLabel: 'Name',
      },
    });
    expect(result.commonErrors).toHaveLength(1);
    expect(result.commonErrors[0].props).toMatchObject({
      id: 'stripes-smart-components.error.defaultSaveError',
      values: {},
    });
  });

  it('uses a custom error mapper when provided for 422 responses', async () => {
    const customErrorMessages = { custom: true };
    const getCustomErrorMessages = jest.fn(() => customErrorMessages);
    const response = createResponse(422, jest.fn().mockResolvedValue({
      errors: [
        {
          code: errorCodes.nameDuplicate,
          parameters: [{ key: 'fieldLabel', value: 'Name' }],
        },
      ],
    }));

    const result = await processBadResponse(
      response,
      errorCodes.defaultSaveError,
      getCustomErrorMessages,
    );

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(getCustomErrorMessages).toHaveBeenCalledWith([
      {
        code: errorCodes.nameDuplicate,
        parameters: [{ key: 'fieldLabel', value: 'Name' }],
      },
    ]);
    expect(result).toBe(customErrorMessages);
  });

  it('falls back to the default error message when 422 JSON parsing fails', async () => {
    const response = createResponse(422, jest.fn().mockRejectedValue(new Error('bad json')));

    const result = await processBadResponse(response, errorCodes.defaultSaveError);

    expect(response.json).toHaveBeenCalledTimes(1);
    expect(result.fieldErrors).toEqual({});
    expect(result.commonErrors).toHaveLength(1);
    expect(result.commonErrors[0].props).toMatchObject({
      id: 'stripes-smart-components.error.defaultSaveError',
      values: {},
    });
  });

  it('returns the conflict error for 409 responses', async () => {
    const response = createResponse(409);

    const result = await processBadResponse(response, errorCodes.defaultSaveError);

    expect(result.fieldErrors).toEqual({});
    expect(result.commonErrors).toHaveLength(1);
    expect(result.commonErrors[0].props).toMatchObject({
      id: 'stripes-smart-components.error.conflict',
      values: {},
    });
  });

  it('returns the default error message for missing or unsupported responses', async () => {
    const result = await processBadResponse(undefined, errorCodes.defaultRemoveError);

    expect(result.fieldErrors).toEqual({});
    expect(result.commonErrors).toHaveLength(1);
    expect(result.commonErrors[0].props).toMatchObject({
      id: 'stripes-smart-components.error.defaultRemoveError',
      values: {},
    });
  });
});

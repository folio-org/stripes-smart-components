import { FormattedMessage } from 'react-intl';
import React from 'react';
import { errorCodes } from './constants';

const getValues = (parameters) => {
  return parameters.reduce((result, { key, value }) => {
    result[key] = value;

    return result;
  }, {});
};

const getErrorMessage = (errorCode, values = {}) => {
  return (
    <FormattedMessage
      key={errorCode}
      id={`stripes-smart-components.error.${errorCode}`}
      values={values}
    />
  );
};

const handleError = (errorMessages, message, values) => {
  const updatedErrorMessages = { ...errorMessages };

  if (values && values.fieldLabel) {
    if (updatedErrorMessages.fieldErrors[values.fieldLabel]) {
      updatedErrorMessages.fieldErrors[values.fieldLabel].push(message);
    } else {
      updatedErrorMessages.fieldErrors[values.fieldLabel] = [message];
    }
  } else {
    updatedErrorMessages.commonErrors.push(message);
  }

  return updatedErrorMessages;
};

const getErrorMessages = (errors, defaultErrorCode) => {
  let errorMessages = {
    fieldErrors: {},
    commonErrors: []
  };

  errors.forEach(({ code, parameters }) => {
    if (code === errorCodes.nameDuplicate) {
      const values = parameters && getValues(parameters);
      const message = getErrorMessage(code, values);

      errorMessages = handleError(errorMessages, message, values);
    } else {
      const message = getErrorMessage(defaultErrorCode);

      errorMessages = handleError(errorMessages, message);
    }
  });

  return errorMessages;
};

const getDefaultErrorMessage = (defaultErrorCode) => {
  const message = getErrorMessage(defaultErrorCode);

  return {
    fieldErrors: {},
    commonErrors: [message],
  };
};

export default async function processBadResponse(response, defaultErrorCode, getCustomErrorMessages = null) {
  if (response.status === 422) {
    try {
      const { errors } = await response.json();

      if (getCustomErrorMessages) {
        return getCustomErrorMessages(errors);
      }

      return getErrorMessages(errors, defaultErrorCode);
    } catch (e) {
      return getDefaultErrorMessage(defaultErrorCode);
    }
  }

  if (response.status === 409) {
    return getDefaultErrorMessage(errorCodes.conflict);
  }

  return getDefaultErrorMessage(defaultErrorCode);
}

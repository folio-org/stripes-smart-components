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
  if (values && values.fieldLabel) {
    if (errorMessages.fieldErrors[values.fieldLabel]) {
      errorMessages.fieldErrors[values.fieldLabel].push(message);
    } else {
      errorMessages.fieldErrors[values.fieldLabel] = [message];
    }
  } else {
    errorMessages.commonErrors.push(message);
  }
};

const getErrorMessages = (errors, defaultErrorCode) => {
  const errorMessages = {
    fieldErrors: {},
    commonErrors: []
  };

  errors.forEach(({ code, parameters }) => {
    if (code === errorCodes.nameDuplicate) {
      const values = parameters && getValues(parameters);
      const message = getErrorMessage(code, values);

      handleError(errorMessages, message, values);
    } else {
      const message = getErrorMessage(defaultErrorCode);

      handleError(errorMessages, message);
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

export default async function processBadResponse(response, defaultErrorCode) {
  if (response.status === 422) {
    try {
      const { errors } = await response.json();

      return getErrorMessages(errors, defaultErrorCode);
    } catch (e) {
      return getDefaultErrorMessage(defaultErrorCode);
    }
  }

  return getDefaultErrorMessage(defaultErrorCode);
}

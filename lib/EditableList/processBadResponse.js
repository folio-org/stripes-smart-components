import { FormattedMessage } from 'react-intl';
import React from 'react';

const getValues = (parameters) => {
  return parameters.reduce((result, { key, value }) => {
    result[key] = value;

    return result;
  }, {});
};

const getErrorMessages = (errors) => {
  const errorMessages = {
    fieldErrors: {},
    commonErrors: []
  };

  errors.forEach(({ code, parameters }) => {
    const values = parameters && getValues(parameters);
    const message = (
      <FormattedMessage
        key={code}
        id={`stripes-smart-components.error.${code}`}
        values={values}
      />
    );

    if (values && values.fieldLabel) {
      if (errorMessages.fieldErrors[values.fieldLabel]) {
        errorMessages.fieldErrors[values.fieldLabel].push(message);
      } else {
        errorMessages.fieldErrors[values.fieldLabel] = [message];
      }
    } else {
      errorMessages.commonErrors.push(message);
    }
  });

  return errorMessages;
};

const getErrors = async (response, defaultErrorCode) => {
  let errors;

  try {
    const responseBody = await response.json();

    errors = responseBody.errors;
  } catch (e) {
    errors = [defaultErrorCode];
  }

  return errors;
};

export default async function processBadResponse(response, defaultErrorCode) {
  let errors = [defaultErrorCode];

  if (response.status === 422) {
    errors = await getErrors(response, defaultErrorCode);
  }

  return getErrorMessages(errors);
}

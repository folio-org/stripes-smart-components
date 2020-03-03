import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Icon,
  Callout,
} from '@folio/stripes-components';

import { CustomFieldsForm } from '../../components';
import {
  selectModuleId,
  selectOkapiData,
} from '../../selectors';

import {
  makeRequest,
  useCustomFieldsFetch,
  useLoadingErrorCallout,
} from '../../utils';

const propTypes = {
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  entityType: PropTypes.string.isRequired,
  okapi: PropTypes.shape({
    tenant: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  redirectToView: PropTypes.func.isRequired,
};

const EditCustomFieldsSettings = ({
  okapi,
  backendModuleId,
  entityType,
  redirectToView,
}) => {
  const {
    customFields,
    customFieldsLoaded,
    hasError,
  } = useCustomFieldsFetch(okapi, backendModuleId, entityType);

  const [submitting, setSubmitting] = useState(false);
  const [submitFinished, setSubmitFinished] = useState(false);
  const { calloutRef, showErrorNotification } = useLoadingErrorCallout(hasError);
  const makeOkapiRequest = useCallback(makeRequest(okapi)(backendModuleId), [okapi, backendModuleId]);

  const getInitialValues = () => {
    return customFields.reduce((customFieldsData, cf) => {
      const {
        id,
        ...formData
      } = cf;

      return [
        ...customFieldsData,
        {
          values: formData,
          id,
        }
      ];
    }, []);
  };

  const updateCustomFields = data => {
    return makeOkapiRequest('custom-fields')({
      method: 'PUT',
      body: JSON.stringify({ customFields: data }),
    });
  };

  const fetchUsageStatistics = useCallback(fieldId => {
    return makeOkapiRequest(`custom-fields/${fieldId}/stats`)({
      method: 'GET',
    });
  }, [makeOkapiRequest]);

  const saveCustomFields = async data => {
    setSubmitting(true);
    const response = await updateCustomFields(data);

    if (response.ok) {
      redirectToView();
    } else {
      showErrorNotification();
      setSubmitting(false);
      setSubmitFinished(true);
    }
  };

  return (
    <>
      {customFieldsLoaded
        ? (
          <CustomFieldsForm
            entityType={entityType}
            initialValues={getInitialValues()}
            redirectToView={redirectToView}
            onSubmit={saveCustomFields}
            submitting={submitting}
            submitSucceed={submitFinished}
            fetchUsageStatistics={fetchUsageStatistics}
          />
        )
        : (
          <Icon
            icon="spinner-ellipsis"
            size="large"
          />
        )
      }
      <Callout ref={calloutRef} />
    </>
  );
};

EditCustomFieldsSettings.propTypes = propTypes;

export default connect(
  (state, ownProps) => ({
    backendModuleId: selectModuleId(state, ownProps.backendModuleName),
    okapi: selectOkapiData(state),
  })
)(EditCustomFieldsSettings);

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Icon } from '@folio/stripes-components';

import { CustomFieldsForm } from '../../components';
import {
  selectModuleId,
  selectOkapiData,
} from '../../selectors';

import {
  makeRequest,
  useCustomFieldsFetch,
} from '../../utils';

const propTypes = {
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired, //eslint-disable-line
  entityType: PropTypes.string.isRequired,
  entityTypeTranslationId: PropTypes.string.isRequired,
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
  entityTypeTranslationId,
  redirectToView,
}) => {
  const {
    customFields,
    customFieldsLoaded,
  } = useCustomFieldsFetch(okapi, backendModuleId);

  const [submitting, setSubmitting] = useState(false);
  const [submitSucceed, setSubmitSucceed] = useState(false);

  const makeOkapiRequest = useCallback(makeRequest(okapi)(backendModuleId), [okapi, backendModuleId]);

  const getInitialValues = () => {
    return customFields.reduce((customFieldsData, cf) => {
      const {
        id,
        metadata,
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

    await updateCustomFields(data);

    setSubmitting(false);
    setSubmitSucceed(true);

    redirectToView();
  };

  return customFieldsLoaded
    ? (
      <CustomFieldsForm
        entityType={entityType}
        entityTypeTranslationId={entityTypeTranslationId}
        initialValues={getInitialValues()}
        redirectToView={redirectToView}
        onSubmit={saveCustomFields}
        submitting={submitting}
        submitSucceed={submitSucceed}
        fetchUsageStatistics={fetchUsageStatistics}
      />
    )
    : (
      <Icon
        icon="spinner-ellipsis"
        size="large"
      />
    );
};

EditCustomFieldsSettings.propTypes = propTypes;

export default connect(
  (state, ownProps) => ({
    backendModuleId: selectModuleId(state, ownProps.backendModuleName),
    okapi: selectOkapiData(state),
  })
)(EditCustomFieldsSettings);

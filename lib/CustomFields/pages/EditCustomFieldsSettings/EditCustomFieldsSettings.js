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
  useSectionTitleFetch,
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
  backendModuleName,
}) => {
  const {
    customFields,
    customFieldsLoaded,
    hasError,
  } = useCustomFieldsFetch(okapi, backendModuleId, entityType);
  const {
    title,
    titleLoading,
    titleHasError,
  } = useSectionTitleFetch(okapi, backendModuleName.toUpperCase());
  const [submitting, setSubmitting] = useState(false);
  const [submitFinished, setSubmitFinished] = useState(false);
  const { calloutRef, showErrorNotification } = useLoadingErrorCallout(hasError);
  const makeOkapiRequest = useCallback(makeRequest(okapi)(backendModuleId), [okapi, backendModuleId]);
  const makeTitleRequest = useCallback(makeRequest(okapi)(), [okapi]);
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

  const updateTitle = data => {
    const body = JSON.stringify({
      module: backendModuleName.toUpperCase(),
      configName: 'custom_fields_label',
      value: data,
    });

    if (title[0]?.id) {
      return makeTitleRequest(`configurations/entries/${title[0].id}`)({
        method: 'PUT',
        body,
      });
    }

    return makeTitleRequest('configurations/entries')({
      method: 'POST',
      body,
    });
  };

  const fetchUsageStatistics = useCallback(fieldId => {
    return makeOkapiRequest(`custom-fields/${fieldId}/stats`)({
      method: 'GET',
    });
  }, [makeOkapiRequest]);

  const saveCustomFields = async (data, accTitle) => {
    setSubmitting(true);

    Promise.all([updateCustomFields(data), updateTitle(accTitle)])
      .then(redirectToView)
      .catch(() => {
        showErrorNotification();
        setSubmitting(false);
        setSubmitFinished(true);
      });
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
            label={title}
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

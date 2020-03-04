import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  intlShape,
  injectIntl,
} from 'react-intl';

import {
  IfPermission,
} from '@folio/stripes/core';
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
  backendModuleName: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  intl: intlShape,
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
  intl,
}) => {
  const {
    customFields,
    customFieldsLoaded,
    customFieldsFetchFailed,
  } = useCustomFieldsFetch(okapi, backendModuleId, entityType);
  const {
    sectionTitle,
    sectionTitleLoaded,
    sectionTitleFetchFailed,
  } = useSectionTitleFetch(okapi, backendModuleName.toUpperCase());
  const [submitting, setSubmitting] = useState(false);
  const [submitFinished, setSubmitFinished] = useState(false);
  const { calloutRef, showErrorNotification } = useLoadingErrorCallout(customFieldsFetchFailed || sectionTitleFetchFailed);
  const makeOkapiRequest = useCallback(makeRequest(okapi)(backendModuleId), [okapi, backendModuleId]);
  const makeTitleRequest = useCallback(makeRequest(okapi)(), [okapi]);
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
  const defaultSectionTitle = intl.formatMessage({ id: 'stripes-smart-components.customFields.recordAccordion.defaultName' });

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

    if (sectionTitle.id) {
      return makeTitleRequest(`configurations/entries/${sectionTitle.id}`)({
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

  const saveCustomFields = async (data, accordionTitle) => {
    setSubmitting(true);

    Promise.all([updateCustomFields(data), updateTitle(accordionTitle)])
      .then(responses => {
        if (responses.every(({ ok }) => !!ok)) {
          redirectToView();
        } else {
          showErrorNotification();
          setSubmitting(false);
          setSubmitFinished(true);
        }
      });
  };

  return (
    <>
      {customFieldsLoaded && sectionTitleLoaded
        ? (
          <IfPermission perm="ui-users.settings.custom-fields.edit">
            <CustomFieldsForm
              entityType={entityType}
              initialValues={getInitialValues()}
              redirectToView={redirectToView}
              onSubmit={saveCustomFields}
              submitting={submitting}
              submitSucceed={submitFinished}
              fetchUsageStatistics={fetchUsageStatistics}
              sectionTitle={sectionTitle.value || defaultSectionTitle}
            />
          </IfPermission>
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
)(injectIntl(EditCustomFieldsSettings));

import React, { useState, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  intlShape,
  injectIntl,
} from 'react-intl';

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
  permissions: PropTypes.shape({
    canDelete: PropTypes.bool,
    canEdit: PropTypes.bool,
    canView: PropTypes.bool,
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
  permissions,
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
  const formRef = useRef();

  const {
    calloutRef,
    showErrorNotification
  } = useLoadingErrorCallout(customFieldsFetchFailed || sectionTitleFetchFailed);

  const [fieldsToDelete, setFieldsToDelete] = useState([]);
  const [dataPendingUpdate, setDataPendingUpdate] = useState(null);
  const [deleteModalIsDisplayed, setDeleteModalIsDisplayed] = useState(false);

  const onDeleteClick = fieldData => currentIndex => {
    if (!fieldData.id.startsWith('unsaved_')) {
      setFieldsToDelete([
        ...fieldsToDelete,
        {
          fieldData,
          currentIndex,
        }
      ]);
    }
  };

  const onDeleteCancellation = () => {
    setDataPendingUpdate(null);
    setDeleteModalIsDisplayed(false);
    setFieldsToDelete([]);
  };

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
          id,
          values: {
            ...formData,
            hidden: !cf.visible
          },
        }
      ];
    }, []);
  };

  const defaultSectionTitle = intl.formatMessage({
    id: 'stripes-smart-components.customFields.recordAccordion.defaultName',
  });

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

  const formatCustomFieldsForBackend = customFieldsFormData => {
    return customFieldsFormData.customFields.map(({ values: { hidden, ...customFieldData } }) => {
      return ({
        ...customFieldData,
        visible: !hidden,
      });
    });
  };

  const saveCustomFields = async data => {
    setSubmitting(true);

    Promise.all([
      updateCustomFields(formatCustomFieldsForBackend(data)),
      updateTitle(data.sectionTitle),
    ]).then(responses => {
      if (responses.every(({ ok }) => !!ok)) {
        redirectToView();
      } else {
        showErrorNotification();
        setSubmitting(false);
      }
    });
  };

  const onDeleteConfirmation = () => {
    saveCustomFields(dataPendingUpdate);
  };

  const onSubmitClick = data => {
    if (fieldsToDelete.length) {
      setDeleteModalIsDisplayed(true);
      setDataPendingUpdate(data);
    } else {
      saveCustomFields(data);
    }
  };

  const formattedFieldsToDeleteData = useMemo(() => fieldsToDelete.reduce((acc, cf) => ([
    ...acc,
    {
      index: cf.index,
      id: cf.fieldData.id,
      name: cf.fieldData.values.name,
    }
  ]), []), [fieldsToDelete]);

  return (
    <>
      {customFieldsLoaded && sectionTitleLoaded
        ? (
          permissions.canEdit
            ? (
              <>
                <CustomFieldsForm
                  entityType={entityType}
                  initialValues={{
                    customFields: getInitialValues(),
                    sectionTitle: sectionTitle.value || defaultSectionTitle
                  }}
                  redirectToView={redirectToView}
                  onSubmit={onSubmitClick}
                  submitting={submitting}
                  fetchUsageStatistics={fetchUsageStatistics}
                  permissions={permissions}
                  onDeleteClick={onDeleteClick}
                  ref={formRef}
                  deleteModalIsDisplayed={deleteModalIsDisplayed}
                  onConfirmDelete={onDeleteConfirmation}
                  onCancelDelete={onDeleteCancellation}
                  fieldsToDelete={fieldsToDelete}
                  formattedFieldsToDeleteData={formattedFieldsToDeleteData}
                />
              </>
            )
            : null
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

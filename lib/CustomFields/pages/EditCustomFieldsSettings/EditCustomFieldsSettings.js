import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
  injectIntl,
} from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';
import { cloneDeep } from 'lodash';

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
  useOptionsStatsFetch,
} from '../../utils';
import { permissionsShape } from '../../shapes';
import { fieldTypesWithOptions } from '../../constants';


const propTypes = {
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  intl: PropTypes.object,
  okapi: PropTypes.shape({
    tenant: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  permissions: permissionsShape.isRequired,
  viewRoute: PropTypes.string.isRequired,
};

const EditCustomFieldsSettings = ({
  okapi,
  backendModuleId,
  entityType,
  viewRoute,
  backendModuleName,
  intl,
  permissions,
  history,
}) => {
  const makeOkapiRequest = useCallback((url) => makeRequest(okapi)(backendModuleId)(url), [okapi, backendModuleId]);
  const makeTitleRequest = useCallback((url) => makeRequest(okapi)()(url), [okapi]);

  const {
    customFields,
    customFieldsLoaded,
    customFieldsFetchFailed,
    setCustomFields,
  } = useCustomFieldsFetch(okapi, backendModuleId, entityType);

  const {
    sectionTitle,
    sectionTitleLoaded,
    sectionTitleFetchFailed,
  } = useSectionTitleFetch(okapi, backendModuleName.toUpperCase());

  const {
    optionsStats,
    optionsStatsLoaded,
    optionsStatsFetchFailed,
  } = useOptionsStatsFetch(okapi, backendModuleId, customFields, entityType);

  const {
    calloutRef,
    showErrorNotification
  } = useLoadingErrorCallout(customFieldsFetchFailed || sectionTitleFetchFailed || optionsStatsFetchFailed);


  const [submitting, setSubmitting] = useState(false);
  const [fieldsToDelete, setFieldsToDelete] = useState([]);
  const [dataPendingUpdate, setDataPendingUpdate] = useState(null);
  const [deleteModalIsDisplayed, setDeleteModalIsDisplayed] = useState(false);
  const [optionsToDelete, setOptionsToDelete] = useState({});

  const onDeleteClick = (fieldData, currentIndex) => {
    if (!fieldData.id.startsWith('unsaved_')) {
      setFieldsToDelete([
        ...fieldsToDelete,
        {
          data: fieldData,
          index: currentIndex,
        }
      ]);
    }
  };

  const handleOptionDelete = fieldId => optionData => {
    const customField = customFields.find(cf => cf.id === fieldId);
    const isFieldSaved = !fieldId.startsWith('unsaved_');
    const isOptionSaved =
      isFieldSaved &&
      customField.selectField.options.values.find(option => optionData.id === option.id);

    if (isOptionSaved) {
      setOptionsToDelete(current => {
        const newOptionsToDelete = { ...current };
        const fieldHasOptionsToDelete = fieldId in optionsToDelete;
        const option = {
          fieldName: customField.name,
          optionData,
        };

        newOptionsToDelete[fieldId] = fieldHasOptionsToDelete
          ? [...newOptionsToDelete[fieldId], option]
          : [option];

        return newOptionsToDelete;
      });
    }
  };

  const onDeleteCancellation = () => {
    setDataPendingUpdate(null);
    setDeleteModalIsDisplayed(false);
    setFieldsToDelete([]);
    setOptionsToDelete({});
  };

  const onFormReset = () => {
    setFieldsToDelete([]);
    setOptionsToDelete({});
  };

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
    return customFieldsFormData.customFields.map(({ values: { hidden, ...customFieldData }, id }) => {
      const customFieldDataWithSortedOptions = cloneDeep(customFieldData);

      if (fieldTypesWithOptions.includes(customFieldData.type)) {
        const options = customFieldDataWithSortedOptions.selectField.options.values;
        customFieldDataWithSortedOptions.selectField.options.values = options
          .sort((a, b) => a.value.localeCompare(b.value));
      }

      return ({
        id: id.startsWith('unsaved_') ? null : id,
        ...customFieldDataWithSortedOptions,
        visible: !hidden,
      });
    });
  };

  const formatCustomFieldsForSaving = customFieldsFormData => {
    return customFieldsFormData.customFields.map(({ values, ...rest }) => ({
      ...rest,
      ...values,
    }));
  };

  const saveCustomFields = async (data, redirectToView = true, titleShouldUpdate = true) => {
    setSubmitting(true);

    const requests = [updateCustomFields(formatCustomFieldsForBackend(data))];

    if (titleShouldUpdate) {
      requests.push(updateTitle(data.sectionTitle));
    }

    Promise.all(requests).then(responses => {
      if (responses.every(({ ok }) => !!ok)) {
        if (redirectToView) {
          history.push(viewRoute);
        }

        // save updated custom fields to reset initial values
        setCustomFields(formatCustomFieldsForSaving(data));
      } else {
        showErrorNotification();
        setSubmitting(false);
      }
    });
  };

  const onDeleteConfirmation = () => {
    saveCustomFields(dataPendingUpdate);
  };

  const onSubmitClick = (data, redirectToView = true) => {
    if (fieldsToDelete.length || Object.keys(optionsToDelete).length) {
      setDeleteModalIsDisplayed(true);
      setDataPendingUpdate(data);
    } else {
      saveCustomFields(data, redirectToView);
    }
  };

  return (
    <>
      {customFieldsLoaded && sectionTitleLoaded
        ? (
          permissions.canEdit
            ? (
              <CustomFieldsForm
                entityType={entityType}
                initialValues={{
                  customFields: getInitialValues(),
                  sectionTitle: sectionTitle.value || defaultSectionTitle
                }}
                viewRoute={viewRoute}
                onSubmit={onSubmitClick}
                submitting={submitting}
                fetchUsageStatistics={fetchUsageStatistics}
                permissions={permissions}
                onDeleteClick={onDeleteClick}
                deleteModalIsDisplayed={deleteModalIsDisplayed}
                onConfirmDelete={onDeleteConfirmation}
                onCancelDelete={onDeleteCancellation}
                fieldsToDelete={fieldsToDelete}
                onFormReset={onFormReset}
                saveCustomFields={saveCustomFields}
                fieldOptionsStats={optionsStats}
                optionsStatsLoaded={optionsStatsLoaded}
                onOptionDelete={handleOptionDelete}
                optionsToDelete={optionsToDelete}
              />
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
)(withRouter(injectIntl(EditCustomFieldsSettings)));

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
  injectIntl,
} from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';

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

import {
  fieldTypes,
  NO_DEFAULT_OPTIONS_VALUE,
} from '../../constants';

const propTypes = {
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.isRequired,
  intl: PropTypes.object,
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
  const makeOkapiRequest = useCallback(makeRequest(okapi)(backendModuleId), [okapi, backendModuleId]);
  const makeTitleRequest = useCallback(makeRequest(okapi)(), [okapi]);

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

  const {
    calloutRef,
    showErrorNotification
  } = useLoadingErrorCallout(customFieldsFetchFailed || sectionTitleFetchFailed);

  const [submitting, setSubmitting] = useState(false);
  const [fieldsToDelete, setFieldsToDelete] = useState([]);
  const [dataPendingUpdate, setDataPendingUpdate] = useState(null);
  const [deleteModalIsDisplayed, setDeleteModalIsDisplayed] = useState(false);

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

  const onDeleteCancellation = () => {
    setDataPendingUpdate(null);
    setDeleteModalIsDisplayed(false);
    setFieldsToDelete([]);
  };

  const onFormReset = () => {
    setFieldsToDelete([]);
  };

  const getInitialValues = () => {
    return customFields.reduce((customFieldsData, cf) => {
      const {
        id,
        ...formData
      } = cf;

      const fieldHasOptions =
        formData.type === fieldTypes.RADIO_BUTTON_GROUP ||
        formData.type === fieldTypes.SELECT;

      if (fieldHasOptions) {
        if (Array.isArray(formData.selectField.defaults)) {
          const hasDefaultOption = formData.selectField.defaults.length;

          if (hasDefaultOption) {
            formData.selectField.defaults = formData.selectField.defaults[0];
          } else {
            formData.selectField.defaults = NO_DEFAULT_OPTIONS_VALUE;
          }
        }
      }
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
      const fieldHasOptions =
        customFieldData.type === fieldTypes.RADIO_BUTTON_GROUP ||
        customFieldData.type === fieldTypes.SELECT;

      if (fieldHasOptions) {
        if (customFieldData.selectField.defaults === NO_DEFAULT_OPTIONS_VALUE) {
          customFieldData.selectField.defaults = [];
        } else {
          customFieldData.selectField.defaults = [customFieldData.selectField.defaults];
        }
      }

      if (customFieldData.type === fieldTypes.MULTISELECT) {
        customFieldData.selectField.defaults = customFieldData.selectField.defaults
          .reduce((acc, option) => {
            if (!customFieldData.selectField.options.values.includes(option)) {
              return acc;
            }

            return Array.isArray(option) ? [...acc, ...option] : [...acc, option];
          }, []);
      }

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
        history.push(viewRoute);
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

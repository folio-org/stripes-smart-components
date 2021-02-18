import React, {
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import {
  Pane,
  Button,
  Icon,
  AccordionSet,
  KeyValue,
  Callout,
} from '@folio/stripes-components';

import { isEmpty } from 'lodash';

import { FieldAccordion } from '../../components';

import {
  useCustomFieldsFetch,
  useSectionTitleFetch,
  useLoadingErrorCallout,
} from '../../utils';

import {
  selectModuleId,
  selectOkapiData,
} from '../../selectors';
import { permissionsShape } from '../../shapes';

import styles from './ViewCustomFieldsSettings.css';

const propTypes = {
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired,
  editRoute: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  okapi: PropTypes.shape({
    tenant: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  permissions: permissionsShape.isRequired,
};

const ViewCustomFieldsSettings = ({
  editRoute,
  okapi,
  backendModuleId,
  entityType,
  backendModuleName,
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

  const { calloutRef } = useLoadingErrorCallout(customFieldsFetchFailed || sectionTitleFetchFailed);
  const paneTitleRef = useRef(null);

  const noDataSaved = isEmpty(customFields) && !sectionTitle.value;

  useEffect(() => {
    if (paneTitleRef.current) {
      paneTitleRef.current.focus();
    }
  }, [paneTitleRef.current]);

  const formattedCustomFieldsData = useMemo(() => {
    if (customFieldsLoaded) {
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
    }

    return null;
  }, [customFields, customFieldsLoaded]);

  const renderLastMenu = () => (
    permissions.canEdit
      ? (
        <Button
          buttonStyle="primary"
          marginBottom0
          to={editRoute}
          data-test-custom-fields-edit-button
        >
          {noDataSaved
            ? <FormattedMessage id="stripes-smart-components.customFields.new" />
            : <FormattedMessage id="stripes-smart-components.customFields.edit" />
          }
        </Button>
      )
      : null
  );

  const renderSectionTitle = () => (
    <KeyValue label={<FormattedMessage id="stripes-smart-components.customFields.settings.accordionTitle" />}>
      <span className={styles.sectionTitle}>
        {sectionTitle.value ||
          <FormattedMessage id="stripes-smart-components.customFields.recordAccordion.defaultName" />}
      </span>
    </KeyValue>
  );

  const renderFieldAccordions = () => (
    <AccordionSet id="custom-fields-list">
      {formattedCustomFieldsData.map(cf => {
        const {
          id,
          ...fieldData
        } = cf;

        return (
          <FieldAccordion
            id={id}
            key={id}
            fieldData={fieldData.values}
            permissions={permissions}
          />
        );
      })}
    </AccordionSet>
  );

  return (
    <>
      {customFieldsLoaded && sectionTitleLoaded
        ? (
          <Pane
            id="custom-fields-pane"
            paneTitle={<FormattedMessage id="stripes-smart-components.customFields" />}
            lastMenu={renderLastMenu()}
            defaultWidth="fill"
            paneTitleRef={paneTitleRef}
          >
            {renderSectionTitle()}
            {renderFieldAccordions()}
          </Pane>
        )
        : (
          <Icon
            icon="spinner-ellipsis"
            size="large"
          />
        )}
      <Callout ref={calloutRef} />
    </>
  );
};

ViewCustomFieldsSettings.propTypes = propTypes;

export default connect(
  (state, ownProps) => ({
    backendModuleId: selectModuleId(state, ownProps.backendModuleName),
    okapi: selectOkapiData(state),
  })
)(ViewCustomFieldsSettings);

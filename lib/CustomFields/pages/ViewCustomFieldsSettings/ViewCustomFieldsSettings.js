import React, {
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

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
  excludeSystemCustomFields,
  getDisplayInAccordionOptions,
  useCustomFieldsQuery,
  useLoadingErrorCallout,
  useSectionTitleQuery,
} from '../../utils';

import { CUSTOM_FIELDS_SECTION_ID } from '../../constants';
import { permissionsShape } from '../../shapes';

import styles from './ViewCustomFieldsSettings.css';

const propTypes = {
  backendModuleName: PropTypes.string.isRequired,
  configNamePrefix: PropTypes.string,
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  editRoute: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  hasDisplayInAccordionField: PropTypes.bool,
  permissions: permissionsShape.isRequired,
  scope: PropTypes.string,
  systemFields: PropTypes.arrayOf(PropTypes.string),
};

const ViewCustomFieldsSettings = ({
  backendModuleName,
  configNamePrefix,
  displayInAccordionOptions = [],
  editRoute,
  entityType,
  hasDisplayInAccordionField = false,
  permissions,
  scope,
  systemFields = [],
}) => {
  const intl = useIntl();

  const {
    customFields,
    isLoadingCustomFields,
    isCustomFieldsError: customFieldsFetchFailed,
  } = useCustomFieldsQuery({
    moduleName: backendModuleName,
    entityType,
  });

  const {
    sectionTitle,
    isLoadingSectionTitle,
    isSectionTitleError: sectionTitleFetchFailed,
  } = useSectionTitleQuery({
    moduleName: backendModuleName.toUpperCase(),
    configNamePrefix,
    scope,
  });

  const { calloutRef } = useLoadingErrorCallout(customFieldsFetchFailed || sectionTitleFetchFailed);
  const paneTitleRef = useRef(null);

  const noDataSaved = isEmpty(customFields) && !sectionTitle.value;
  const sectionTitleValue = sectionTitle.value || intl.formatMessage({ id: 'stripes-smart-components.customFields.recordAccordion.defaultName' });
  const customFieldsLoaded = !isLoadingCustomFields && !customFieldsFetchFailed;
  const sectionTitleLoaded = !isLoadingSectionTitle && !sectionTitleFetchFailed;

  useEffect(() => {
    if (paneTitleRef.current) {
      paneTitleRef.current.focus();
    }
  });

  const formattedCustomFieldsData = useMemo(() => {
    if (customFieldsLoaded) {
      return excludeSystemCustomFields(systemFields, customFields).reduce((customFieldsData, cf) => {
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
              displayInAccordion: formData.displayInAccordion || CUSTOM_FIELDS_SECTION_ID,
              hidden: !cf.visible
            },
          }
        ];
      }, []);
    }

    return null;
  }, [customFields, customFieldsLoaded, systemFields]);

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
        {sectionTitleValue}
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
            hasDisplayInAccordionField={hasDisplayInAccordionField}
            displayInAccordionOptions={getDisplayInAccordionOptions(sectionTitleValue, displayInAccordionOptions)}
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

export default ViewCustomFieldsSettings;

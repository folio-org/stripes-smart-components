import React from 'react';
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

import {
  FieldAccordion,
  NoCustomFieldsMessage,
} from '../../components';

import {
  useCustomFieldsFetch,
  useLoadingErrorCallout,
} from '../../utils';

import {
  selectModuleId,
  selectOkapiData,
} from '../../selectors';

import styles from './ViewCustomFieldsSettings.css';

const propTypes = {
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  entityType: PropTypes.string.isRequired,
  okapi: PropTypes.shape({
    tenant: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  redirectToEdit: PropTypes.func.isRequired,
};

const ViewCustomFieldsSettings = ({ redirectToEdit, okapi, backendModuleId, entityType }) => {
  const {
    customFields,
    customFieldsLoaded,
    hasError,
  } = useCustomFieldsFetch(okapi, backendModuleId, entityType);

  const { calloutRef } = useLoadingErrorCallout(hasError);
  const customFieldsExist = customFieldsLoaded && !isEmpty(customFields);

  const renderLastMenu = () => (
    <Button
      buttonStyle="primary"
      marginBottom0
      onClick={redirectToEdit}
      data-test-custom-fields-edit-button
    >
      <FormattedMessage id="stripes-smart-components.customFields.edit" />
    </Button>
  );

  const renderSectionTitle = () => (
    <KeyValue label={<FormattedMessage id="stripes-smart-components.customFields.settings.sectionTitle" />}>
      <span className={styles.sectionTitle}>
        <FormattedMessage id="stripes-smart-components.customFields.recordAccordion.defaultName" />
      </span>
    </KeyValue>
  );

  const renderFieldAccordions = () => (
    <AccordionSet id="custom-fields-list">
      {customFields.map(cf => {
        const {
          id,
          ...fieldData
        } = cf;

        return (
          <FieldAccordion
            id={id}
            key={id}
            fieldData={{ ...fieldData }}
          />
        );
      })}
    </AccordionSet>
  );

  return (
    <>
      {customFieldsLoaded
        ? (
          <Pane
            paneTitle={<FormattedMessage id="stripes-smart-components.customFields.editCustomFields" />}
            lastMenu={renderLastMenu()}
            defaultWidth="fill"
          >
            {renderSectionTitle()}
            {
              customFieldsExist
                ? renderFieldAccordions()
                : <NoCustomFieldsMessage />
            }
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

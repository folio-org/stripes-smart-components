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
} from '@folio/stripes-components';

import { NoCustomFieldsMessage } from './components';
import {
  FieldAccordion,
  TextboxViewSection,
} from '../../components';
import {
  selectModuleId,
  selectOkapiData,
} from '../../selectors';

import { useCustomFieldsFetch } from '../../hooks';

import styles from './CustomFieldsSettings.css';

const propTypes = {
  backendModuleId: PropTypes.string.isRequired,
  backendModuleName: PropTypes.string.isRequired,
  okapi: PropTypes.object.isRequired,
  redirectToEdit: PropTypes.func.isRequired,
};

const CustomFieldsSettingsPane = ({ redirectToEdit, okapi, backendModuleId }) => {
  const { customFields, customFieldsLoaded } = useCustomFieldsFetch(okapi, backendModuleId);

  const renderLastMenu = () => (
    <Button
      buttonStyle="primary"
      marginBottom0
      onClick={redirectToEdit}
    >
      {customFields.length
        ? <FormattedMessage id="stripes-smart-components.customFields.edit" />
        : <FormattedMessage id="stripes-smart-components.customFields.new" />
      }
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
    <AccordionSet>
      {customFields.map(cf => (
        <FieldAccordion formData={{ ...cf }}>
          <TextboxViewSection {...cf} />
        </FieldAccordion>
      ))}
    </AccordionSet>
  );

  return customFieldsLoaded
    ? (
      <Pane
        paneTitle={<FormattedMessage id="stripes-smart-components.customFields.editCustomFields" />}
        lastMenu={renderLastMenu()}
      >
        {renderSectionTitle()}
        {customFields.length
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
    );
};

CustomFieldsSettingsPane.propTypes = propTypes;

export default connect(
  (state, ownProps) => ({
    backendModuleId: selectModuleId(state, ownProps.backendModuleName),
    okapi: selectOkapiData(state),
  })
)(CustomFieldsSettingsPane);

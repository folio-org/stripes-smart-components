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

import {
  FieldAccordion,
  NoCustomFieldsMessage,
} from '../../components';

import { useCustomFieldsFetch } from '../../utils';

import {
  selectModuleId,
  selectOkapiData,
} from '../../selectors';

import styles from './ViewCustomFieldsSettings.css';

const propTypes = {
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired, // eslint-disable-line
  okapi: PropTypes.object.isRequired,
  redirectToEdit: PropTypes.func.isRequired,
};

const ViewCustomFieldsSettings = ({ redirectToEdit, okapi, backendModuleId }) => {
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

  return customFieldsLoaded
    ? (
      <Pane
        paneTitle={<FormattedMessage id="stripes-smart-components.customFields.editCustomFields" />}
        lastMenu={renderLastMenu()}
        defaultWidth="fill"
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

ViewCustomFieldsSettings.propTypes = propTypes;

export default connect(
  (state, ownProps) => ({
    backendModuleId: selectModuleId(state, ownProps.backendModuleName),
    okapi: selectOkapiData(state),
  })
)(ViewCustomFieldsSettings);

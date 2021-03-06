import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Pane,
  PaneFooter,
} from '@folio/stripes-components';

import styles from './ConfigManager.css';

const ConfigForm = (props) => {
  const {
    handleSubmit,
    pristine,
    submitting,
    label,
    children,
  } = props;

  const footer = (
    <PaneFooter
      renderEnd={(
        <Button
          type="submit"
          buttonStyle="primary"
          disabled={(pristine || submitting)}
          marginBottom0
          id="clickable-save-config"
        >
          <FormattedMessage id="stripes-core.button.save" />
        </Button>
      )}
    />
  );

  return (
    <form
      id="config-form"
      onSubmit={handleSubmit}
      className={styles.configForm}
    >
      <Pane
        defaultWidth="fill"
        paneTitle={label}
        footer={footer}
      >
        {children}
      </Pane>
    </form>
  );
};

ConfigForm.propTypes = {
  children: PropTypes.node,
  handleSubmit: PropTypes.func.isRequired,
  label: PropTypes.node,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
};

export default ConfigForm;

import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  checkScope,
  HasCommand,
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
    lastMenu,
  } = props;
  const paneTitleRef = useRef();

  const handlePaneFocus = useCallback(() => {
    return paneTitleRef.current?.focus();
  }, []);

  const shortcuts = [
    {
      name: 'save',
      handler: e => {
        e.preventDefault();

        if (!(pristine || submitting)) {
          handleSubmit();
        }
      },
    },
  ];

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
    <HasCommand
      commands={shortcuts}
      isWithinScope={checkScope}
      scope={document.body}
    >
      <form
        id="config-form"
        onSubmit={handleSubmit}
        className={styles.configForm}
      >
        <Pane
          defaultWidth="fill"
          paneTitle={label}
          paneTitleRef={paneTitleRef}
          footer={footer}
          onMount={handlePaneFocus}
          lastMenu={lastMenu}
        >
          {children}
        </Pane>
      </form>
    </HasCommand>
  );
};

ConfigForm.propTypes = {
  children: PropTypes.node,
  handleSubmit: PropTypes.func.isRequired,
  label: PropTypes.node,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  lastMenu: PropTypes.element,
};

export default ConfigForm;

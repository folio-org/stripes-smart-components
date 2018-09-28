import React from 'react';
import PropTypes from 'prop-types';
import { Button, Pane } from '@folio/stripes-components';
import stripesForm from '@folio/stripes-form';

const ConfigForm = (props) => {
  const {
    handleSubmit,
    pristine,
    submitting,
    label,
    children,
  } = props;

  const lastMenu = (
    <Button
      type="submit"
      buttonStyle="primary paneHeaderNewButton"
      disabled={(pristine || submitting)}
      marginBottom0
      id="clickable-save-config"
    >
    Save
    </Button>
  );

  return (
    <form id="config-form" onSubmit={handleSubmit}>
      <Pane defaultWidth="fill" paneTitle={label} lastMenu={lastMenu}>
        {children}
      </Pane>
    </form>
  );
};

ConfigForm.propTypes = {
  children: PropTypes.node,
  handleSubmit: PropTypes.func.isRequired,
  label: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
};

export default stripesForm({
  form: 'configForm',
  navigationCheck: true,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ConfigForm);

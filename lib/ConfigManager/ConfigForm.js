import React from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';
import Pane from '@folio/stripes-components/lib/Pane';
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
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  label: PropTypes.string,
  children: PropTypes.node,
};

export default stripesForm({
  form: 'configForm',
  navigationCheck: true,
  enableReinitialize: true,
})(ConfigForm);

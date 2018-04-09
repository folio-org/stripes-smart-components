import React from 'react';
import PropTypes from 'prop-types';
import Select from '@folio/stripes-components/lib/Select';
import stripesForm from '@folio/stripes-form';
import { Field } from 'redux-form';

class LocationForm extends React.Component {
  static contextTypes = {
    stripes: PropTypes.object,
  };

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
  };

  render() {
    const { handleSubmit } = this.props;

    return (
      <form id="location-form" onSubmit={handleSubmit()}>
        <Field label="institutions" name="institution" component={Select} />
      </form>
    );
  }
}

export default stripesForm({
  form: 'locationForm',
  navigationCheck: false,
  enableReinitialize: false,
})(LocationForm);

import React from 'react';
import PropTypes from 'prop-types';
import Selection from '@folio/stripes-components/lib/Selection';
import { Field } from 'redux-form';

export default class LocationInput extends React.Component {
  static contextTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
  };

  static propTypes = {
    onLocationSelected: PropTypes.func.isRequired,
    label: PropTypes.string,
    name: PropTypes.string,
    resources: PropTypes.shape({
      locations: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    locations: {
      type: 'okapi',
      records: 'locations',
      path: 'locations',
    },
  });

  render() {
    const { stripes: { intl } } = this.context;
    const { resources, label, name, onLocationSelected } = this.props;
    const locations = (resources.locations || {}).records || [];

    if (!locations.length) return (<div />);

    const locationOpts = locations.map(loc => ({ label: `${loc.name} (${loc.code})`, value: loc.id }));
    const locationPlaceholder = intl.formatMessage({ id: 'stripes-smart-components.ls.locationPlaceholder' });

    return (
      <Field
        name={name}
        label={label}
        component={Selection}
        rounded
        onChange={(e, data) => onLocationSelected(data)}
        placeholder={locationPlaceholder}
        dataOptions={locationOpts}
      />
    );
  }
}

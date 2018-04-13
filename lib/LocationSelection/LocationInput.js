import React from 'react';
import PropTypes from 'prop-types';
import Selection from '@folio/stripes-components/lib/Selection';
import { Field } from 'redux-form';

import { escapeRegExp } from './util';

export default class LocationInput extends React.Component {
  static contextTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
  };

  static propTypes = {
    onLocationSelected: PropTypes.func,
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

  constructor() {
    super();

    this.filter = this.filter.bind(this);
    this.onLocationSelected = this.onLocationSelected.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  filter(value, data) {
    return data.filter(o => new RegExp(escapeRegExp(value), 'i').test(o.label));
  }

  onLocationSelected(e, locId) {
    if (this.props.onLocationSelected) {
      this.props.onLocationSelected(locId);
    }
  }

  render() {
    const { stripes: { intl } } = this.context;
    const { resources, label, name } = this.props;
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
        onChange={this.onLocationSelected}
        onFilter={this.filter}
        placeholder={locationPlaceholder}
        dataOptions={locationOpts}
      />
    );
  }
}

import React from 'react';
import PropTypes from 'prop-types';
import { escapeRegExp } from 'lodash';
import Selection from '@folio/stripes-components/lib/Selection';

export default class LocationInput extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    resources: PropTypes.shape({
      locations: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    input: PropTypes.object,
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
    this.onChange = this.onChange.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  filter(value, data) {
    return data.filter(o => new RegExp(escapeRegExp(value), 'i').test(o.label));
  }

  onChange(e, locId) {
    const { resources, input: { onChange } } = this.props;
    const locations = (resources.locations || {}).records || [];

    if (onChange) {
      const location = locations.find(l => l.id === locId);
      onChange(location);
    }
  }

  render() {
    const { resources } = this.props;
    const locations = (resources.locations || {}).records || [];

    if (!locations.length) return (<div />);

    const locationOpts = locations.map(loc => ({ label: `${loc.name} (${loc.code})`, value: loc.id }));

    return (
      <Selection
        marginBottom0
        {...this.props}
        dataOptions={locationOpts}
        onFilter={this.filter}
        onChange={this.onChange}
      />
    );
  }
}

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { escapeRegExp } from 'lodash';
import { Selection } from '@folio/stripes-components';

class LocationInput extends React.Component {
  static manifest = Object.freeze({
    locations: {
      type: 'okapi',
      records: 'locations',
      path: 'locations',
      params: {
        query: 'cql.allRecords=1 sortby name',
        limit: '1000',
      },
    },
  });

  static propTypes = {
    input: PropTypes.object,
    intl: PropTypes.object.isRequired,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    remoteMap: PropTypes.arrayOf(PropTypes.object),
    resources: PropTypes.shape({
      locations: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
  };

  constructor() {
    super();

    this.filter = this.filter.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(locId) {
    const { resources, onSelect } = this.props;
    const locations = (resources.locations || {}).records || [];

    if (onSelect) {
      const location = locations.find(l => l.id === locId);
      onSelect(location);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  filter(value, data) {
    return data.filter(o => new RegExp(escapeRegExp(value), 'i').test(o.label));
  }

  render() {
    const { resources, placeholder, remoteMap, intl } = this.props;
    const locations = (resources.locations || {}).records || [];

    if (!locations.length) return (<div />);

    const locationOpts = locations.map(loc => {
      const remoteLocationLabel = (
        remoteMap && (loc.id in remoteMap)
      ) ? intl.formatMessage({ id: 'stripes-smart-components.remoteLabel' }) : '';

      return {
        label: `${loc.name} (${loc.code}) ${remoteLocationLabel}`,
        value: loc.id,
      };
    });

    return (
      <Selection
        marginBottom0
        {...this.props}
        dataOptions={[{ label: `${placeholder}`, value: '' }, ...locationOpts]}
        onFilter={this.filter}
        onChange={this.onChange}
      />
    );
  }
}

export default injectIntl(LocationInput);

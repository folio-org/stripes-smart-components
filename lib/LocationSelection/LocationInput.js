import React from 'react';
import PropTypes from 'prop-types';
import { escapeRegExp } from 'lodash';
import { Selection } from '@folio/stripes-components';

import { RemoteStorageTag } from '../RemoteStorageTag';

const LocationInput = (props) => {
  const onChange = (locId) => {
    const { resources, onSelect } = props;
    const locations = (resources.locations || {}).records || [];

    if (onSelect) {
      const location = locations.find(l => l.id === locId);
      onSelect(location);
    }
  };

  const filter = (value, data) => {
    return data.filter(o => new RegExp(escapeRegExp(value), 'i').test(o.label));
  };

  const { resources, placeholder } = props;
  const locations = (resources.locations || {}).records || [];

  if (!locations.length) return (<div />);

  const locationOpts = locations.map(loc => {
    return {
      label: <>{loc.name} ({loc.code}) <RemoteStorageTag location={loc} /></>,
      value: loc.id,
    };
  });

  return (
    <Selection
      marginBottom0
      {...props}
      dataOptions={[{ label: `${placeholder}`, value: '' }, ...locationOpts]}
      onFilter={filter}
      onChange={onChange}
    />
  );
};

LocationInput.manifest = Object.freeze({
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

LocationInput.propTypes = {
  input: PropTypes.object,
  onSelect: PropTypes.func,
  placeholder: PropTypes.string,
  remoteMap: PropTypes.arrayOf(PropTypes.object),
  resources: PropTypes.shape({
    locations: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

export default LocationInput;

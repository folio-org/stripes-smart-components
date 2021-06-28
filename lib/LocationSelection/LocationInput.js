import React from 'react';
import PropTypes from 'prop-types';
import { escapeRegExp } from 'lodash';
import { useIntl } from 'react-intl';
import { Selection } from '@folio/stripes-components';

import { useRemoteStorageMappings } from '../utils';

const LocationInput = (props) => {
  const remoteMap = useRemoteStorageMappings();
  const intl = useIntl();
  const { resources, placeholder, onSelect } = props;
  const locations = resources.locations.records;

  const getRemoteStorageTag = location => (
    remoteMap[location.id] ?
      intl.formatMessage({ id: 'stripes-smart-components.ll.remoteLabel' }) :
      '');

  const onChange = (locId) => {
    if (onSelect) {
      const location = locations.find(l => l.id === locId);
      onSelect(location);
    }
  };

  const filter = (value, data) => data.filter(o => new RegExp(escapeRegExp(value), 'i').test(o.label));

  if (!locations.length) return (<div />);

  const locationOpts = locations.map(loc => {
    return {
      label: `${loc.name} (${loc.code}) ${getRemoteStorageTag(loc)}`,
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

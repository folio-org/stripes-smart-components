import React from 'react';
import PropTypes from 'prop-types';
import { escapeRegExp } from 'lodash';
import { useIntl } from 'react-intl';
import { Selection } from '@folio/stripes-components';

import { useRemoteStorageMappings } from '../utils';

const LocationInput = (props) => {
  const remoteMap = useRemoteStorageMappings();
  const { formatMessage } = useIntl();
  const { resources, placeholder, onSelect } = props;
  const locations = resources.locations.records;
  const locationOpts = locations.map(({ code, name, id }) => ({
    label: `${name} (${code}) ${remoteMap[id] ? formatMessage({ id: 'stripes-smart-components.ll.remoteLabel' }) : ''}`,
    value: id,
  }));

  const onChange = (locId) => {
    if (onSelect) {
      const location = locations.find(l => l.id === locId);
      onSelect(location);
    }
  };

  const filter = (value, data) => data.filter(o => new RegExp(escapeRegExp(value), 'i').test(o.label));

  if (!locations.length) return (<div />);


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

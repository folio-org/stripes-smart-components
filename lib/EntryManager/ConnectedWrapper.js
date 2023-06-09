import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useOkapiKy } from '@folio/stripes/core';
import { Loading } from '@folio/stripes/components';

function ConnectedWrapper({ resourcePath, initialValues, underlyingComponent, ...rest }) {
  const okapiKy = useOkapiKy();
  const [record, setRecord] = useState();
  const [loading, setLoading] = useState(false);

  if (!record) {
    if (!loading) {
      setLoading(true);
      okapiKy(`${resourcePath}/${initialValues.id}`)
        .then(res => res.json().then(rec => {
          setRecord(rec);
          setLoading(false);
        }));
    }
    return <Loading />;
  }

  const Component = underlyingComponent;
  return <Component initialValues={record} {...rest} />;
}

ConnectedWrapper.propTypes = {
  resourcePath: PropTypes.string.isRequired,
  initialValues: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  underlyingComponent: PropTypes.func, // React component
};

export default ConnectedWrapper;

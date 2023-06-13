import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useOkapiKy } from '@folio/stripes/core';
import { Loading } from '@folio/stripes/components';

function ConnectedWrapper({ resourcePath, initialValues, underlyingComponent, ...rest }) {
  const okapiKy = useOkapiKy();
  const [record, setRecord] = useState();
  const Component = underlyingComponent;

  useEffect(() => {
    if (initialValues.id) {
      okapiKy(`${resourcePath}/${initialValues.id}`)
        .then(res => res.json().then(rec => {
          setRecord(rec);
        }));
    }
    // If `okpaiKy` is included in the dependency list, the effect fires on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.id, resourcePath]);

  if (!initialValues.id) {
    // Creating a new record: pass through
    return <Component initialValues={initialValues} {...rest} />;
  }

  if (!record) {
    return <Loading />;
  }

  return <Component initialValues={record} {...rest} />;
}

ConnectedWrapper.propTypes = {
  resourcePath: PropTypes.string.isRequired,
  initialValues: PropTypes.shape({
    id: PropTypes.string,
  }).isRequired,
  underlyingComponent: PropTypes.func, // React component
};

export default ConnectedWrapper;

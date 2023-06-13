import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useOkapiKy } from '@folio/stripes/core';
import { Loading } from '@folio/stripes/components';

function ConnectedWrapper({ resourcePath, initialValues, underlyingComponent, ...rest }) {
  const okapiKy = useOkapiKy();
  const [record, setRecord] = useState();
  const Component = underlyingComponent;

  console.log('in ConnectedWrapper, id =', initialValues.id);
  useEffect(() => {
    console.log(' useEffect', [initialValues.id, okapiKy, resourcePath]);
    if (initialValues.id) {
      console.log(`  fetching from ${resourcePath}/${initialValues.id}`);
      okapiKy(`${resourcePath}/${initialValues.id}`)
        .then(res => res.json().then(rec => {
          console.log(`   got record with name ${rec.name}`);
          setRecord(rec);
        }));
    }
    // If `okpaiKy` is included in the dependency list, the effect fires on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.id, resourcePath]);

  if (!initialValues.id) {
    // Creating a new record: pass through
    console.log(' no ID, creating new record');
    return <Component initialValues={initialValues} {...rest} />;
  }

  if (!record) {
    console.log(' no record yet, showing spinner');
    return <Loading />;
  }

  console.log(' got record yet, showing underlying component');
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

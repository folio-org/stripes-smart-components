export default okapi => moduleId => path => options => {
  const headers = {
    'x-okapi-tenant': okapi.tenant,
    'content-type': 'application/json',
    ...options.headers,
  };

  const okapiModuleId = moduleId ? { 'x-okapi-module-id': moduleId } : {};

  return fetch(`${okapi.url}/${path}`, {
    credentials: 'include',
    mode: 'cors',
    ...options,
    headers: {
      ...headers,
      ...okapiModuleId,
    },
  });
};

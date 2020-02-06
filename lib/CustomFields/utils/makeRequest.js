export default okapi => moduleId => path => options => {
  return fetch(`${okapi.url}/${path}`, {
    ...options,
    headers: {
      'x-okapi-token': okapi.token,
      'x-okapi-tenant': okapi.tenant,
      'content-type': 'application/json',
      'x-okapi-module-id': moduleId,
      ...options.headers,
    },
  });
};

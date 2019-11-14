export default function (server) {
  server.post('/', {
    'errors': [{
      'message': 'Cannot create entity; name is not unique',
      'code': 'name.duplicate'
    }]
  }, 422);
}
